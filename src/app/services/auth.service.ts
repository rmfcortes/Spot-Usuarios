import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Storage } from '@ionic/storage';

import { auth } from 'firebase/app';
import { AngularFireAuth } from '@angular/fire/auth';
import { Facebook } from '@ionic-native/facebook/ngx';

import { UidService } from './uid.service';
import { DisparadoresService } from './disparadores.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private fb: Facebook,
    private storage: Storage,
    private platform: Platform,
    public authFirebase: AngularFireAuth,
    private alertService: DisparadoresService,
    private uidService: UidService,
  ) { }

  // Check isLog

  async getUser() {
    return new Promise (async (resolve, reject) => {
      if ( this.platform.is('cordova') ) {
        // Celular
        this.storage.ready().then(async () => {
          try {
            const uid = await this.storage.get('uid')
            if (uid) {
              const nombre = await this.storage.get('nombre')
              const foto = await this.storage.get('foto')
              this.uidService.setUid(uid)
              this.uidService.setFoto(foto)
              this.uidService.setNombre(nombre)
              resolve(true)
            } else {
              await this.revisaFireAuth()
              resolve(true)
            }
          } catch (error) {
            resolve(false)
          }
        });
      } else {
        // Escritorio
        if ( localStorage.getItem('uid') ) {
          const uid = localStorage.getItem('uid')
          const foto = localStorage.getItem('foto')
          const nombre = localStorage.getItem('nombre')
          this.uidService.setUid(uid)
          this.uidService.setFoto(foto)
          this.uidService.setNombre(nombre)
          resolve(uid)
        } else {
          try {
            await this.revisaFireAuth()
            resolve(true)
          } catch (error) {
            resolve(false)
          }
        }
      }

    });
  }

  async revisaFireAuth() {
    return new Promise((resolve, reject) => {
      const authSub = this.authFirebase.authState.subscribe(async (user) => {
        authSub.unsubscribe()
        if (user) {
          const usuario =  {
            nombre: user.displayName,
            foto: user.photoURL,
            uid: user.uid
          };
          await this.setUser(usuario.uid, usuario.nombre, usuario.foto)
          resolve(true)
        } else {
          reject()
        }
      });
    });
  }

  // Auth

  facebookLogin() {
    return new Promise((resolve, reject) => {
      this.fb.login(['public_profile', 'email'])
        .then(res => {
          const credential = auth.FacebookAuthProvider.credential(res.authResponse.accessToken);
          return this.authFirebase.auth.signInWithCredential(credential)
        })
        .then(async (response) => {
          await this.setUser(response.user.uid, response.user.displayName, response.user.photoURL)
          this.alertService.presentToast('Bienvenido ' + response.user.displayName)
          resolve()
        })
        .catch(e => {
          reject(e)
          console.log(e)
        })
    });
  }

  async loginWithEmail(email, pass) {
    return new Promise(async (resolve, reject) => {
    try {
        const resp = await this.authFirebase.auth.signInWithEmailAndPassword(email, pass);
        const user = this.authFirebase.auth.currentUser
        this.setUser(resp.user.uid, user.displayName, null)
        this.alertService.presentToast('Bienvenido ' + user.displayName)
        resolve()
      } catch (error) {
        reject(error)
      }
    });
  }

  async registraUsuario(usuario) {
    return new Promise(async (resolve, reject) => {
      try {
        const res = await this.authFirebase.auth.createUserWithEmailAndPassword(usuario.correo, usuario.pass);
        if (!res) { return; }
        await this.authFirebase.auth.signInWithEmailAndPassword(usuario.correo, usuario.pass);
        const user = this.authFirebase.auth.currentUser
        await user.updateProfile({displayName: usuario.nombre})
        this.setUser(user.uid, user.displayName, null);
        resolve(true);
      } catch (err) {
        switch (err.code) {
          case 'auth/email-already-exists':
            reject('El usuario ya está registrado en una cuenta');
            break;
          case 'auth/invalid-email':
            reject('El usuario no correponde a un email válido');
            break;
          case 'auth/invalid-password':
            reject('Contraseña insegura. La contraseña debe tener al menos 6 caracteres');
            break;
          default:
            reject('Error al registrar. Intenta de nuevo');
            break;
        }
        if (err.code === 'auth/email-already-in-use') {
          reject('Este usuario ya está registrado. Intenta con otro');
        } else {
          reject('Error al registrar. Intenta de nuevo');
        }
      }
    });
  }

  // Reset password

  async resetPass(email) {
    return new Promise(async (resolve, reject) => {
      try {
        await this.authFirebase.auth.sendPasswordResetEmail(email);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  // SetUser

  setUser(uid: string, nombre: string, foto: string) {
    return new Promise (async (resolve, reject) => {
      if (this.platform.is ('cordova')) {
        this.storage.set('uid', uid)
        this.storage.set('foto', foto)
        this.storage.set('nombre', nombre)
      } else {
        localStorage.setItem('uid', uid)
        localStorage.setItem('foto', foto)
        localStorage.setItem('nombre', nombre)
      }
      this.uidService.setUid(uid)
      this.uidService.setFoto(foto)
      this.uidService.setNombre(nombre)
      resolve();
    });
  }

  // Logout

  async logout() {
    return new Promise(async (resolve, reject) => {
      try {
        await this.authFirebase.auth.signOut();
        if ( this.platform.is('cordova') ) {
          this.storage.remove('uid')
          this.storage.remove('foto')
          this.storage.remove('nombre')
        } else {
          localStorage.removeItem('uid')
          localStorage.removeItem('foto')
          localStorage.removeItem('nombre')
        }
        this.uidService.setUid(null)
        this.uidService.setFoto(null)
        this.uidService.setNombre(null)
        this.alertService.presentToast('Ahora navegas como invitado')
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }


}
