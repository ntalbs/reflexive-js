const http = require('http');

const hostname = '127.0.0.1';
const port = 3000;

function queries(url) {
  let queries = {};
  for (var [k, v] of url.searchParams.entries()) {
    if (!queries[k]) {
      queries[k] = v;
    } else if (Array.isArray(queries[k])) {
      queries[k].push(v);
    } else {
      queries[k] = [queries[k], v];
    }
  }
  return queries;
}

async function body(req) {
  const buffers = [];
  for await (const chunk of req) {
    buffers.push(chunk);
  }
  const data = Buffer.concat(buffers).toString();
  try {
    return JSON.parse(data);
  } catch (e) {
    return null
  }
}

const server = http.createServer(async (req, res) => {
  console.info(new Date(), req.method, req.url);

  const url = new URL(req.url, `http://${hostname}:${port}`);
  const echo = {
    "method": req.method,
    "path": url.pathname,
    "queries": queries(url),
    "headers": req.headers,
    "body": await body(req)
  };

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(echo));
});

server.listen(port, () => {
  console.log(new Date(), `Server running at http://${hostname}:${port}`);
});
