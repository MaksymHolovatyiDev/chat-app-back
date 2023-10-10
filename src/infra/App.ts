import {Database} from './Database';
import {Tcp} from './Tcp';

export class App {
  private static instance: App;

  private database = new Database();
  private tcp = new Tcp();

  constructor() {
    if (!App.instance) App.instance = this;
    return App.instance;
  }

  async init() {
    console.log('App started!');

    await this.database.init();
    await this.tcp.init();
  }
}
