import { Request, Application, Response, Router } from 'express';
import { Keycloak } from "keycloak-connect";
import KeyStore from './keystore';
const KeycloakInstance = require('keycloak-connect');

export class KeyCloakFactory {
  private keyCloak: Keycloak

  constructor() {

    this.keyCloak = new KeycloakInstance({ cookies: true });

    this.keyCloak.redirectToLogin = () => false;
    this.keyCloak.accessDenied = (req, res) => res.redirect('/access-denied');

    // The Interface for the Keycloak instance does not list the stores array
    // so to keep it from throwing a fit, we cast it as any.  This is not 
    // TS fault, this is Keycloak's fault for bad docs
    (this.keyCloak as any).stores[1] = new KeyStore();

  }

  configureKeycloakMiddleware(app: Application | Router, logoutUrl: string) {
    let result = this.keyCloak.middleware({
      logout: logoutUrl,
      admin: '/'
    })

    app.use(result);
  }

  get keycloakInstance() {
    return this.keyCloak;
  }

  async loginUser(credentialStr: string, req: Request, res: Response) {
    const header = credentialStr.split(' ')[1];

    const [ username, password ] = Buffer.from(header, 'base64').toString().split(':')

    const grant = await this.keyCloak.grantManager.obtainDirectly(username, password)
    this.keyCloak.storeGrant(grant, req, res); 
    return grant;
  }

  protect() {
    return this.keyCloak.protect();
  }

}