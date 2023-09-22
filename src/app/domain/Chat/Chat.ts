import {Post, JsonController} from 'routing-controllers';

@JsonController('/Chat')
export default class Chat {
  @Post()
  async Chat() {}
}
