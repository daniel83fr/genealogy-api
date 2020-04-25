import { Request, Response } from "express";

export function renderIndex(req:Request, res:Response) {
  res.send(`
      <h1>API Doc:</h1>
      <a href="http://localhost:3000/api-docs/"> API Swagger </a>
<br/>
      <a href="http://localhost:3000/api/v1/person/5e6556427af677179baf2e5a">Person</a>
      <br/>
      <a href="http://localhost:3000/api/v1/person/5e6556427af677179baf2e5a/raw">raw person</a>
      <br/>
      <a href="http://localhost:3000/api/v1/person/5e6556427af677179baf2e5a/relation">raw relation</a>
      `);
}