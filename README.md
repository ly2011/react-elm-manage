## 使用

### 使用命令行
```bash
$ npm install
$ npm start         # 访问 http://localhost:8000
```

### 知识点总结

- dva@2中dispatch回调

1. 使用 `Promise`

在pages(业务中的请求)

```js
new Promise((resolve) => {
    dispatch({
      type: 'model/fetch',
      payload: {
        resolve,
        id: userId,
      }
    })
}).then((res) => {
    console.log(res);
})
```

然后在 `model` 中的 `effects` 中这样写：

```js
*fetch({ payload }, { call }) {
  const { resolve } = payload;
  const { data } = yield call(services.fetch, payload);
  if (data.code === 0) {
    // 通过resolve返回数据，返回的数据将在Promise的then函数中获取到
    !!resolve && resolve(data.data);
}
```

[dva.js的dispatch有回调吗？](https://segmentfault.com/q/1010000012421949/a-1020000012436323)

2. `dva@2` 中 `dispatch` 添加了 `Promise`：

```js
(cd) => dispatch(...).then(() => cd());
```