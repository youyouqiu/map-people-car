## table 拓展参数说明

`ref`: 封装了table内部reload刷新方法,以及头部的form对象  
ref.current = {  
    `reload`, //刷新方法   
    `updateDataOne`, // 不刷新table，直接更新某条数据接受两个参数一个是行数据，一个是key，用来做对比用   
    `queryForm`  // 头部form对象  
    `reloadPageOne`  // 加载第一页  
    `getQueryArgs`  // 获取查询参数  
}  
`queryArgs`： 默认查询条件  
`queryAjax`: 查询请求  
`rowChange`：多选改变时触发  
`rowClick`：点击行事件  
`tableBodyClassName`: 最外层组件的className  
`className`: 作用于antd的Table组件上  
`showTree`: 显示隐藏树  
`tree`: 树组件  
`refresh`: 右侧刷新回调函数  
`showPage`: 是否展示分页


添加默认查询参数，可以用queryArgs进行替换  

### columns 拓展
`filter`: 过滤   
{  
    `style`: {}, // 样式   
    `type`: true, // 是否为多选；默认为多选即true；false为单选  
    `key`: 'nameFilter',// 筛选请求参数名  
    `pid`: '', // 针对字典值设置，通过pid查找到相应的字典值及下级值  
    `domData`: [{value: '',label: '正确',style:{}}] // 过滤条件   
}  
`sorterKey`: 'namekey' // 排序请求参数名, 有这参数就可以排序


### 头部查询组件组

`queryDom`: 类型为RractDOM的数组,当没有值时；影藏该头部Dom  
`queryBtn`: 类型为RractDOM的数组，Button 属性 htmlType="submit" 时，为form的提交按钮
`initialValues`: 设置初始值  
`hideQueryBtn`: 隐藏查询按钮  

### 设置行

`showSetting`: 是否显示设置行 默认true

### 设置行-左侧参数

`btnGroup`: 在新增按钮前添加DOM，类型为RractDOM的数组  

### 设置行-右侧参数

`showSettingLeft`: 是否显示右侧组件组；默认true  
`showSettingQuery`: 是否显示右侧查询组件；默认true  
`settingQuery`: 为对象 placeholder属性为提示语，key为查询条件  
`settingQueryStyle`: 为对象 设置input的样式