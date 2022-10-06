import { basicInfo } from "./basicInfo";
import { servers } from "./servers"
import { tags } from "./tags";
import { components } from "./components";
import { hash } from "./hash";
import { credential } from "./credential";
import { verify } from "./verify";
import { fetch } from "./fetch";

const paths = {
  ...hash,
  ...credential,
  ...verify,
  ...fetch,
};

export const swaggerDocs = {
  ...basicInfo,
  ...{ servers: servers },
  ...{ tags: tags },
  ...components,
  ...{ paths: paths },
};