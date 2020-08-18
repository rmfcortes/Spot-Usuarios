import { Component, OnInit, ViewChild } from '@angular/core';
import { IonSlides, ModalController } from '@ionic/angular';

import { DisparadoresService } from 'src/app/services/disparadores.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  @ViewChild (IonSlides, {static: false}) slide: IonSlides;

  slideOpts = {
    initialSlide: 0,
    slidesPerView: 1,
    autoplay: false,
    loop: false,
    centeredSlides: true,
    speed: 800
  }

  correo: string
  pass: string

  usuario = {
    nombre: '',
    pass: '',
    passConfirm: '',
    correo: '',
  }

  constructor(
    private commonService: DisparadoresService,
    private modalCtrl: ModalController,
    private authService: AuthService,
  ) { }

  ngOnInit() {
  }

  ionViewDidEnter() {
    this.slide.lockSwipes(true)
  }

  async loginFace() {
    await this.commonService.presentLoading()
    try {
      await this.authService.facebookLogin()
      this.commonService.dismissLoading()
      this.salir(true)
    } catch (error) {
      this.commonService.dismissLoading()
      this.commonService.presentAlert('Error', 'Algo salió mal, por favor intenta de nuevo' + error)
    }
  }

  async ingresarConCorreo() {
    await this.commonService.presentLoading()
    try {
      await this.authService.loginWithEmail(this.correo, this.pass)
      this.commonService.dismissLoading()
      this.salir(true)
    } catch (error) {
      this.commonService.dismissLoading()
      if (error.code === 'auth/user-not-found') {
        this.commonService.presentAlert('Usuario no registrado', 'Por favor registra una cuenta antes de ingresar')
      } else {
        console.log(error)
        this.commonService.presentAlert('Error', 'Algo salió mal, por favor intenta de nuevo. ' + error)
      }
    }
  }

  async generarCuenta() {
    if (this.usuario.pass !== this.usuario.passConfirm) {
      this.commonService.presentAlert('Error', 'La contraseña de confirmación debe ser igual a la contraseña')
      return
    }
    await this.commonService.presentLoading()
    try {
      await this.authService.registraUsuario(this.usuario)
      this.commonService.dismissLoading()
      this.salir(true)
    } catch (error) {
        this.commonService.presentAlert('Error', error)
    }
  }

  async resetPass() {
    if (!this.correo) {
      this.commonService.presentAlert('Ingresa tu correo', 'Enviaremos un enlace a tu correo, en el cuál podrás restaurar tu contraseña');
      return
    }
    this.commonService.presentLoading()
    try {
      await this.authService.resetPass(this.correo)
      this.commonService.dismissLoading()
      this.commonService.presentAlert('Listo', 'Por favor revisa tu correo, hemos enviado un enlace para que puedas restaurar tu contraseña');
    } catch (error) {
      this.commonService.dismissLoading()
      this.commonService.presentAlert('Error', 'Por favor intenta de nuevo más tarde. Estamos teniendo problemas técnicos');
    }
  }

  salir(data?) {
    this.modalCtrl.dismiss(data)
  }


  // Auxiliares

  mostrarFormularioCuenta() {
    this.slide.lockSwipes(false)
    this.slide.slideNext()
    this.slide.lockSwipes(true)
  }

  regresar() {
    this.slide.lockSwipes(false)
    this.slide.slidePrev()
    this.slide.lockSwipes(true)
  }

}
