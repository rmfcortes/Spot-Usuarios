import { Injectable } from '@angular/core';

import { auth } from 'firebase/app';
import { AngularFireAuth } from '@angular/fire/auth';
import { Facebook } from '@ionic-native/facebook/ngx';

import { UidService } from './uid.service';
import { DisparadoresService } from './disparadores.service';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  entradas = 1

  constructor(
    private fb: Facebook,
    public authFirebase: AngularFireAuth,
    private alertService: DisparadoresService,
    private storageService: StorageService,
    private uidService: UidService,
  ) { }

  // Check isLog

  checkUser(): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      let user
      user = this.uidService.getUid()
      if (user) return resolve(user)
      if (this.entradas <= 1) {
        user = await this.getUser()
        if (user) return resolve(user)
        this.entradas++
        return resolve(false)
      } else {
        this.entradas++
        return resolve(false)
      }
    })
  }

  async getUser() {
    return new Promise (async (resolve, reject) => {
      const uid = await this.storageService.getString('uid')
      if (uid) {
        const foto = await this.storageService.getString('foto')
        const nombre = await this.storageService.getString('nombre')
        this.uidService.setUid(uid)
        this.uidService.setFoto(foto)
        this.uidService.setNombre(nombre)
        resolve(true)
      } else {
        try {
          await this.revisaFireAuth()
          resolve(true)
        } catch (error) {
          resolve(false)
        }
      }
    })
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
          }
          await this.setUser(usuario.uid, usuario.nombre, usuario.foto)
          resolve(true)
        } else {
          resolve(false)
        }
      })
    })
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
    })
  }

  async loginWithEmail(email, pass) {
    return new Promise(async (resolve, reject) => {
    try {
        const resp = await this.authFirebase.auth.signInWithEmailAndPassword(email, pass)
        const user = this.authFirebase.auth.currentUser
        this.setUser(resp.user.uid, user.displayName, null)
        this.alertService.presentToast('Bienvenido ' + user.displayName)
        resolve()
      } catch (error) {
        reject(error)
      }
    })
  }

  async registraUsuario(usuario) {
    return new Promise(async (resolve, reject) => {
      try {
        const res = await this.authFirebase.auth.createUserWithEmailAndPassword(usuario.correo, usuario.pass)
        if (!res) return
        await this.authFirebase.auth.signInWithEmailAndPassword(usuario.correo, usuario.pass)
        const user = this.authFirebase.auth.currentUser
        await user.updateProfile({displayName: usuario.nombre})
        this.setUser(user.uid, user.displayName, null)
        resolve(true)
      } catch (err) {
        switch (err.code) {
          case 'auth/email-already-exists':
            reject('El usuario ya está registrado en una cuenta')
            break
          case 'auth/invalid-email':
            reject('El usuario no correponde a un email válido')
            break
          case 'auth/invalid-password':
            reject('Contraseña insegura. La contraseña debe tener al menos 6 caracteres')
            break
          default:
            reject('Error al registrar. Intenta de nuevo')
            break
        }
        if (err.code === 'auth/email-already-in-use') {
          reject('Este usuario ya está registrado. Intenta con otro')
        } else {
          reject('Error al registrar. Intenta de nuevo')
        }
      }
    })
  }

  // Reset password

  async resetPass(email) {
    return new Promise(async (resolve, reject) => {
      try {
        await this.authFirebase.auth.sendPasswordResetEmail(email)
        resolve()
      } catch (error) {
        reject(error)
      }
    });
  }

  // SetUser

  setUser(uid: string, nombre: string, foto: string) {
    return new Promise (async (resolve, reject) => {
      this.storageService.guardaString('uid', uid)
      this.storageService.guardaString('foto', foto)
      this.storageService.guardaString('nombre', nombre)
      this.uidService.setUid(uid)
      this.uidService.setFoto(foto)
      this.uidService.setNombre(nombre)
      resolve()
    })
  }

  // Logout

  async logout() {
    return new Promise(async (resolve, reject) => {
      try {
        await this.authFirebase.auth.signOut()
        this.storageService.remove('uid')
        this.storageService.remove('foto')
        this.storageService.remove('nombre')
        this.uidService.setUid(null)
        this.uidService.setFoto(null)
        this.uidService.setNombre(null)
        this.alertService.presentToast('Ahora navegas como invitado')
        resolve()
      } catch (error) {
        reject(error)
      }
    })
  }


}
