import { Global, Module } from '@nestjs/common';
import { FirebaseIdentityProvider } from './firebase-identity.provider';
import { IdentityProvider } from './identity-provider';

@Global()
@Module({
  providers: [{ provide: IdentityProvider, useClass: FirebaseIdentityProvider }],
  exports: [IdentityProvider],
})
export class FirebaseModule {}
