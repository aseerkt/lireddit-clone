import { Query, Resolver } from 'type-graphql';

@Resolver()
export class UserResovler {
  @Query(() => String)
  hello() {
    return 'Hello World';
  }
}
