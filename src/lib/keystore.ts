import { Request, Response } from "express";

export default class KeyStore {
  public TOKEN_NAME = "keycloak-token";

  public get(request: Request) {
    const token = request.cookies[this.TOKEN_NAME];

    if (token) {
      return JSON.parse(token);
    }

    return;
  }

  public wrap(grant: any) {
    grant.store = this.store(grant);
    grant.unstore = this.unstore;
  }

  public store(grant: any) {
    return (req: Request, res: Response) => {
      const maxAgeMilliseconds = 900000;

      res.cookie(this.TOKEN_NAME, grant.__raw, {
        maxAge: maxAgeMilliseconds,
        httpOnly: true,
      });
    };
  }

  public unstore(req: Request, res: Response) {
    res.clearCookie(this.TOKEN_NAME);
  }
}
