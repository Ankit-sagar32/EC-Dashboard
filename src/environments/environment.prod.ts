import { DevConfig } from './ec-configuration/devConfig';
import { baseUrl } from './ec-configuration/baseurlconfig';

export const UrlConfig = {
  'localhost:4200': DevConfig,
  'baseUrl': baseUrl
};
export const environment = {
  production: true
};
