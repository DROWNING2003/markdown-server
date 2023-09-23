const Koa = require("koa");
const url = require("url");
const qs = require("querystring");
const mathjax = require("mathjax-node");
const yuml2svg = require("yuml2svg");

mathjax.start();

const app = new Koa();

app.use(async (ctx) => {
  const queryObj = qs.parse(url.parse(ctx.req.url).query);
  const tex = queryObj.tex;
  const yuml = queryObj.yuml;
  const theme = queryObj.theme;

  const errFn = (msg) => {
    ctx.status = 404;
    ctx.body = msg;
  };

  const successFn = (result) => {
    ctx.status = 200;
    ctx.type = "image/svg+xml;charset=utf-8";
    ctx.body = result;
  };

  if (yuml) {
    try {
      const v = await yuml2svg(yuml, { isDark: theme === "dark" });
      successFn(v);
    } catch (e) {
      errFn("Yuml formula is wrong!");
    }
  } else if (tex) {
    mathjax.typeset(
      {
        math: tex,
        format: "TeX",
        svg: true,
      },
      (data) => {
        if (theme === "dark") {
          data.svg = data.svg.replace(/fill="currentColor"/g, 'fill="#ffffff"');
        }
        successFn(data.svg);
      }
    );
  } else {
    errFn(
      "Please pass LaTeX formula via `tex` parameter or `Yuml` expression using `yuml` parameter."
    );
  }
});
app.listen(8001);
