import {Tcp} from './Tcp';

export class App {
  private static instance: App;

  private tcp = new Tcp();

  constructor() {
    if (!App.instance) App.instance = this;
    return App.instance;
  }

  async init() {
      console.log('App started!');
      
      await this.tcp.init();
  }
}
