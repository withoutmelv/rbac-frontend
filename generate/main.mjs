import fs from 'node:fs';

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

/* eslint-disable no-console */
// 引入yargs模块
// 引入config模块
import config from 'config';
/**
 *  ● 引入path依赖库
    ● 引入fs依赖库
    ● 获取当前目录
    ● 定义数据目录常量
    ● 定义一个函数，入参为json文件名称，出参为数据目录对应文件的内容，并将内容转成json对象
 */
import path from 'node:path';

import artTemplate from 'art-template';
import request from 'request';

/**
 * 定义命令行参数tableName，别名为t，描述为表名称，必填
 * 定义命令行参数cover，别名为c，描述为是否覆盖，取舍1或0，默认值为0，非必填
 */
// eslint-disable-next-line n/prefer-global/process
const argv = yargs(hideBin(process.argv))
  .option('tableName', {
    alias: 't',
    demandOption: true,
    describe: '表名称',
    type: 'string',
  })
  .option('cover', {
    alias: 'c',
    default: 0,
    describe: '是否覆盖',
    type: 'number',
  })
  .option('data', {
    alias: 'd',
    default: 0,
    describe: '是否仅生成元数据',
    type: 'number',
  })
  .help()
  .alias('help', 'h').argv;
// 获取tableName和cover参数
const { cover, tableName } = argv;
const genDir = path.resolve(import.meta.dirname);
const rootDir = path.resolve(genDir, '../');

// 控制台打印tableName和cover
console.log(`tableName: ${tableName}, cover: ${cover}`);
/**
 * {
  "apiUrl": "https://lowcode.mldong.com/api/dev/schema/getByTableName",
  "theme": "default",
  "appId": "1631219416960266241",
  "appSecret": "",
  "templates": [
    {
      "name": "首页模板",
      "selected": true,
      "templateFile": "index.art",
      "targetPath": "src/views/<{moduleName}>/<{tableCamelName}>",
      "targetFileName": "index.vue"
    }
  ]
}
 */
// 从cconfig模块中获取apiUrl、theme、appId、appSecret、templates属性，采用析构的方式
const { apiUrl, appId, appSecret, templates, theme } = config;
// 控制台打印apiUrl
console.log(`apiUrl: ${apiUrl}`);
console.log(`theme: ${theme}`);
console.log(`appId: ${appId}`);
console.log(`appSecret: ${appSecret}`);
console.log(`templates: ${JSON.stringify(templates, null, 2)}`);
/**
 * 定义一个函数，请求接中获取元数据，入骖为tableName，出参为元数据,使用Promise异步处理
 * curl -H 'appId:1631219416960266241' -X GET https://lowcode.mldong.com/api/dev/schema/getByTableName?tableName=sys_role
 * 使用request请求库发送请求
 */
const getMetaData = (tableName) => {
  return new Promise((resolve, reject) => {
    request(
      {
        headers: {
          appId,
          appSecret,
        },
        json: true,
        method: 'GET',
        qs: {
          tableName,
        },
        url: apiUrl,
      },
      (err, res, body) => {
        if (err) {
          reject(err);
        }
        if (body.code === 0) {
          const d = body?.data;
          // 增加kebab-case字段
          if (d) {
            d.kebabCaseName = tableName
              .replace(`${d.moduleName}_`, '')
              .replaceAll('_', '-');
            d.config = config;
          }
          resolve(d);
        } else {
          reject(body?.msg);
        }
      },
    );
  });
};

/**
 * 定义一个函数，返回所有选中的模板数组
 * 读取所有模板内容，存入templateContent字段，并将字段追加到templates数组中
 */
const getSelectedTemplates = (data) => {
  const selectedTemplates = [];
  templates
    .filter((template) => {
      if (typeof template.selected === 'string') {
        // 模板语法
        return artTemplate.render(template.selected, data) === 'true';
      }
      return true;
    })
    .forEach((template) => {
      if (
        (argv.data !== 1 && template.selected) ||
        (argv.data === 1 && template.data)
      ) {
        const templateFile = template.templateFile;
        let mTheme = theme;
        // 如果元数据配置有模板主题，则使用元数据的配置
        if (
          data?.ext?.theme &&
          fs.existsSync(path.join(genDir, 'templates', data?.ext?.theme))
        ) {
          mTheme = data?.ext?.theme;
        }
        // 读取模板内容前要判断文件是否存在
        console.log(path.join(genDir, 'templates', mTheme, templateFile));
        if (
          fs.existsSync(path.join(genDir, 'templates', mTheme, templateFile))
        ) {
          const templateContent = fs.readFileSync(
            path.join(genDir, 'templates', mTheme, templateFile),
            'utf8',
          );
          template.templateContent = templateContent;
          selectedTemplates.push(template);
        }
      }
    });
  return selectedTemplates;
};
// 定义一个函数，入参为文件路径，如果文件不存在，则自创建目录
const createDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, {
      recursive: true,
    });
  }
};
// 原始语法的界定符规则
artTemplate.defaults.rules[0].test =
  // eslint-disable-next-line regexp/no-super-linear-backtracking
  /<%(#?)((?:==|=#|[=-])?)[ \t]*([\s\S]*?)[ \t]*(-?)%>/;
// 标准语法的界定符规则
// eslint-disable-next-line regexp/no-super-linear-backtracking
artTemplate.defaults.rules[1].test = /<\{([@#]?)[ \t]*(\/?)([\s\S]*?)[ \t]*\}>/;
// 禁止转义
artTemplate.defaults.escape = false;
// 禁止压缩
artTemplate.defaults.minimize = false;
// 给artTemplate导入的模板变量stringify为JSON.stringify
artTemplate.defaults.imports.stringify = JSON.stringify; // url转成方法名
// 处理默认值
artTemplate.defaults.imports.handleDefault = function (v, columm) {
  if (v) {
    if (columm?.componentProps?.dataType === 'number') {
      return Number(v);
    }
    if (columm.dataType === '12') {
      return Number(v);
    }
  }
  return v;
};
// 将形如url地址/sys/user/testPost 转成小驼峰命名 sysUserTestPost
artTemplate.defaults.imports.urlToCamelCase = (url) => {
  const str = url.slice(1).replaceAll('/', '_');
  // 下划线转小驼峰
  return str.replaceAll(/_(\w)/g, (all, letter) => {
    return letter.toUpperCase();
  });
};
// 定义一个函数，给data.columns数组的每一个元素追加componentProps
const appendComponentProps = (data) => {
  data?.columns.forEach((column) => {
    const componentProps = {};
    // 组件配置以组件配置+下划线开头，例：Input_xx，Select_xx
    Object.keys(column.ext)
      .filter((key) => key.startsWith(`${column.component}_`))
      .forEach((key) => {
        componentProps[key.replace(`${column.component}_`, '')] =
          column.ext[key];
      });
    column.componentProps = componentProps;
    column.componentProps.placeholder =
      column.ext?.placeholder || `请输入${column.remark}`;
    if (
      [
        'ApiCascader',
        'ApiDict',
        'ApiSelect',
        'ApiTreeSelect',
        'AutoComplete',
        'Select',
        'Upload',
      ].includes(column.component)
    ) {
      column.componentProps.placeholder =
        column.ext?.placeholder || `请选择${column.remark}`;
      if (
        column.component === 'ApiDict' &&
        componentProps.renderType === 'RadioGroup'
      ) {
        componentProps.isBtn = componentProps.isBtn !== 0;
      }
      if (column.component === 'ApiTreeSelect') {
        const replaceFields = componentProps.replaceFields || {};
        if (Object.keys(replaceFields).length > 0) {
          componentProps.labelField = replaceFields.title || 'name';
          componentProps.valueField = replaceFields.value || 'id';
          delete componentProps.replaceFields;
        }
      }
    }
    if (column.component === 'RangePicker') {
      if (column.placeholder) {
        columm.componentProps.placeholder = column.ext.placeholder.split(',');
      } else {
        column.componentProps.placeholder = ['开始日期', '结束日期'];
      }
    } else if (column.component === 'CustomComponent') {
      // 自定义组件需要特殊处理
      column.component = column.componentProps.componentName;
      delete column.componentProps.componentName;
    } else if (
      column.component === 'Switch' &&
      column.componentProps.dataType === 'number'
    ) {
      column.componentProps.unCheckedValue = Number(
        column.componentProps.unCheckedValue || 0,
      );
      column.componentProps.checkedValue = Number(
        column.componentProps.checkedValue || 1,
      );
    }
    column.searchComponentProps = column.componentProps;

    if (
      (column.component === 'ApiSelect' && column.ext.searchType === 'IN') ||
      (column.component === 'ApiDict' &&
        column.componentProps.renderType === 'Select' &&
        column.ext.searchType === 'IN')
    ) {
      // 设置为多选
      column.searchComponentProps.mode = 'multiple';
    }
  });
};
/**
 * 根据模板文件名获取模板配置
 * @param {*} templateFile
 */
const getTemplateByFileName = (templateFile) => {
  const template = templates.find((item) => item.templateFile === templateFile);
  if (template !== null) {
    const templateFile = template.templateFile;
    // 读取模板内容前要判断文件是否存在
    if (fs.existsSync(path.join(genDir, 'templates', theme, templateFile))) {
      const templateContent = fs.readFileSync(
        path.join(genDir, 'templates', theme, templateFile),
        'utf8',
      );
      template.templateContent = templateContent;
    }
    return template;
  }
};
const _createCustomComponent = (template, column, data) => {
  // 获取模板内容
  const templateContent = template.templateContent;
  // 使用 artTemplate 模板引擎渲染模板内容
  const renderContent = artTemplate.render(templateContent, data);
  // 使用 artTemplate 模板引擎渲染目标路径
  const targetPath = artTemplate.render(template.targetPath, data);
  // 使用 artTemplate 模板引擎渲染目标文件名
  const targetFileName = `${column.component}.vue`;
  // 构建目标文件路径

  const targetFile = path.join(rootDir, targetPath, targetFileName);
  // 创建目标路径

  createDir(path.join(rootDir, targetPath));
  // 如果覆盖参数为2
  if (cover === 2) {
    // 直接将渲染内容写入目标文件
    fs.writeFileSync(targetFile, renderContent);
  } else {
    // 如果目标文件不存在
    if (!fs.existsSync(targetFile)) {
      // 将渲染内容写入目标文件
      fs.writeFileSync(targetFile, renderContent);
    }
  }
};
/**
 * 创建自定义表单/列表组件(src/views/<{moduleName}>/<{tableCamelName}>/components/form|view目录下)
 * @param {*} data
 */
const createCustomComponent = (data) => {
  // 获取所有自定义组件列
  const customColumns =
    data?.columns.filter(
      (column) => column.component === column.ext.CustomComponent_componentName,
    ) || [];
  const customFormComponent = getTemplateByFileName('customFormComponent.art');
  const customViewComponent = getTemplateByFileName('customViewComponent.art');
  customColumns.forEach((column) => {
    const isCreateForm =
      (column.ext.addHide !== true && column.ext.addHide !== 1) ||
      (column.ext.editHide !== true && column.ext.editHide !== 1);
    const isCreateView =
      (column.ext.listHide !== true && column.ext.viewHide !== 1) ||
      (column.ext.listHide !== true && column.ext.viewHide !== 1);
    if (isCreateForm) {
      _createCustomComponent(customFormComponent, column, data);
    }
    if (isCreateView) {
      _createCustomComponent(customViewComponent, column, data);
    }
  });
};
tableName?.split(',').forEach((tableName) => {
  getMetaData(tableName)
    .then((data) => {
      // 定义变量selectedTemplates，调用getSelectedTemplates函数
      const selectedTemplates = getSelectedTemplates(data);
      appendComponentProps(data);
      // forEach遍历selectedTemplates，使用artTemplate渲染模板template.templateContent
      selectedTemplates.forEach((template) => {
        // 获取模板内容
        const templateContent = template.templateContent;
        // 使用 artTemplate 模板引擎渲染模板内容
        const renderContent = artTemplate.render(templateContent, data);
        // 使用 artTemplate 模板引擎渲染目标路径
        const targetPath = artTemplate.render(template.targetPath, data);
        // 使用 artTemplate 模板引擎渲染目标文件名
        const targetFileName = artTemplate.render(
          template.targetFileName,
          data,
        );
        // 构建目标文件路径
        const targetFile = path.join(rootDir, targetPath, targetFileName);
        // 创建目标路径
        createDir(path.join(rootDir, targetPath));
        // 如果覆盖参数为1
        if (cover === 1) {
          // 直接将渲染内容写入目标文件
          fs.writeFileSync(targetFile, renderContent);
        } else {
          // 如果目标文件不存在
          if (fs.existsSync(targetFile)) {
            // 如果为仅生成元数据
            if (argv.data === 1) {
              fs.writeFileSync(targetFile, renderContent);
            }
          } else {
            // 将渲染内容写入目标文件
            fs.writeFileSync(targetFile, renderContent);
          }
        }
      });
      // 创建自定义表单/列表组件(src/views/<{moduleName}>/<{tableCamelName}>/components/form|view目录下)
      createCustomComponent(data);
    })
    .catch((error) => {
      console.log(error);
    });
});
