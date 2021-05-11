class Kisi {
    constructor(ad, soyad, mail) {
        this.ad = ad;
        this.soyad = soyad;
        this.mail = mail;
    }
}
class Util {
    static bosAlanKontrolEt(...alanlar) {
        let sonuc = true;
        alanlar.forEach(alan => {
            if (alan.length === 0) {
                sonuc = false;
                return false;
            }
        });
        return sonuc;
    }
    static emailKontrol(email) {
        const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }
}
class Ekran {
    constructor() {
        this.ad = document.getElementById('ad');
        this.soyad = document.getElementById('soyad');
        this.mail = document.getElementById('mail');
        this.ekleGuncelleButton = document.querySelector('.kaydetGuncelle');
        this.form = document.getElementById('form-rehber');
        this.form.addEventListener('submit', this.kaydetGuncelle.bind(this));
        this.kisiListesi = document.querySelector('.kisi-listesi');
        this.kisiListesi.addEventListener('click', this.guncelleVeyaSil.bind(this));
        this.depo = new Depo();
        //edit ve delete buttonlarina basildiginda ilgili tr elemani burada tutulur.
        this.secilenSatir = undefined;
        this.kisileriEkranaYazdir();
    }
    alanlariTemizle() {
        this.ad.value = '';
        this.soyad.value = '';
        this.mail.value = '';
    }
    guncelleVeyaSil(e) {
        const tiklananYer = e.target;
        if (tiklananYer.classList.contains('btn--edit')) {
            this.secilenSatir = tiklananYer.parentElement.parentElement;
            this.ekleGuncelleButton.value = 'Güncelle';
            this.ad.value = this.secilenSatir.cells[0].textContent;
            this.soyad.value = this.secilenSatir.cells[1].textContent;
            this.mail.value = this.secilenSatir.cells[2].textContent;
        } else if (tiklananYer.classList.contains('btn--delete')) {
            this.secilenSatir = tiklananYer.parentElement.parentElement;
            this.kisiyiEkrandanSil();
        }
    }
    kisiyiEkrandaGuncelle(kisi) {
        const sonuc = this.depo.kisiGuncelle(kisi, this.secilenSatir.cells[2].textContent);
        if (sonuc) {
            this.secilenSatir.cells[0].textContent = kisi.ad;
            this.secilenSatir.cells[1].textContent = kisi.soyad;
            this.secilenSatir.cells[2].textContent = kisi.mail;
            this.secilenSatir = undefined;
            this.bilgiOlustur('Guncelleme Islemi Basarili Bir Sekilde Yapildi !', true);
            this.ekleGuncelleButton.value = 'Kaydet';
            this.alanlariTemizle();
        } else {
            this.bilgiOlustur('Guncelleme asamasinda daha onceden sisteme kayitli bir mail adresi girilmistir.', false);
        }
    }
    kisiyiEkrandanSil() {
        this.secilenSatir.remove();
        const silinecekMail = this.secilenSatir.cells[2].textContent;
        this.depo.kisiSil(silinecekMail);
        this.alanlariTemizle();
        this.secilenSatir = undefined;
        this.bilgiOlustur('Kisi Rehberden Silinmistir . . .', true);
        this.ekleGuncelleButton.value = 'Kaydet';
    }
    kisileriEkranaYazdir() {
        this.depo.tumKisiler.forEach(kisi => {
            this.kisiyiEkranaEkle(kisi);
        });
    }
    kisiyiEkranaEkle(kisi) {
        const olusturulanTrElemani = document.createElement('tr');
        olusturulanTrElemani.innerHTML = `<td>${kisi.ad}</td>
        <td>${kisi.soyad}</td>
        <td>${kisi.mail}</td>
        <td>
            <button class="btn btn--edit"><i class="far fa-edit"></i></button>
            <button class="btn btn--delete"><i class="far fa-trash-alt"></i></button>
        </td>`;
        this.kisiListesi.appendChild(olusturulanTrElemani);
    }
    kaydetGuncelle(e) {
        e.preventDefault();
        const kisi = new Kisi(this.ad.value, this.soyad.value, this.mail.value);
        const sonuc = Util.bosAlanKontrolEt(kisi.ad, kisi.soyad, kisi.mail);
        const emailKontrol = Util.emailKontrol(this.mail.value);
        console.log(kisi);

        //tum alanlar doldurulmus, bos alan yok.
        if (sonuc) {
            if (!emailKontrol) {
                this.bilgiOlustur('Lutfen gecerli bir mail adresi giriniz .', false);
                return;
            }
            if (this.secilenSatir) { //secilenSatir eger undefined degilse guncelleme islemi yapilacak
                this.kisiyiEkrandaGuncelle(kisi);
            } else {    //secilenSatir eger undefined ise kaydetme islemi yapilacak
                //localStorage ekler.
                const sonuc = this.depo.kisiEkle(kisi);
                if (sonuc) {
                    console.log('Eksik alan YOK ve email de kullanimda degil ! Kisi sorunsuzca eklendi .');
                    //yeni kisiyi ekrana ekler.
                    this.kisiyiEkranaEkle(kisi);
                    this.alanlariTemizle();
                    this.bilgiOlustur('Kaydetme Islemi Basarili Bir Sekilde Yapildi !', true);
                } else {
                    this.bilgiOlustur('Girmis Oldugunuz E-mail Kullanimda.', false);
                    console.log('Girilen mail daha onceden kullanilmis. Bu yuzden ekleme islemi yapilamadi !')
                }
            }
        } else { //bos alan var.
            console.log("BOS BIRAKILAN ALAN VAR ! ! !");
            this.bilgiOlustur('Lutfen Bos Alan BIRAKMAYINIZ ! ! !', false);
        }
    }
    bilgiOlustur(mesaj, durum) {
        const olusturulanBilgiDiv = document.createElement('div');
        olusturulanBilgiDiv.className = 'bilgi';
        olusturulanBilgiDiv.textContent = mesaj;

        //ternary if kullanimi
        olusturulanBilgiDiv.classList.add(durum ? 'bilgi--success' : 'bilgi--error');

        const container = document.querySelector('.container');
        container.insertBefore(olusturulanBilgiDiv, this.form);  //container icerisinde form elemanindan once olusturulanBilgiDiv eklenir.

        setTimeout(function () {
            const silinecekDiv = document.querySelector('.bilgi');
            if (silinecekDiv) {
                silinecekDiv.remove();
            }
        }, 2000)
    }
}
class Depo {
    constructor() {
        this.tumKisiler = this.kisileriGetir();
    }
    //uygulama ilk acildiginda veriler getirilir.
    kisileriGetir() {
        let tumKisilerLocal;
        if (localStorage.getItem('tumKisiler') === null) {
            tumKisilerLocal = [];
        } else {
            tumKisilerLocal = JSON.parse(localStorage.getItem('tumKisiler'));
        }
        return tumKisilerLocal;
    }
    kisiEkle(kisi) {
        if (this.emailKullanimdaMi(kisi.mail)) {
            return false; //kisi localStorage'a eklenemedi.
        } else {
            this.tumKisiler.push(kisi);
            localStorage.setItem('tumKisiler', JSON.stringify(this.tumKisiler));
            return true; //kisi basarili bir sekilde localStorage'a eklendi.
        }
    }
    kisiSil(mail) {
        this.tumKisiler.forEach((kisi, index) => {
            if (kisi.mail === mail) {
                this.tumKisiler.splice(index, 1);
            }
        });
        localStorage.setItem('tumKisiler', JSON.stringify(this.tumKisiler));
    }
    kisiGuncelle(guncellenmisKisi, mail) {
        if (guncellenmisKisi.mail === mail) {
            this.tumKisiler.forEach((kisi, index) => {
                if (kisi.mail === mail) {
                    this.tumKisiler[index] = guncellenmisKisi;
                }
            });
            localStorage.setItem('tumKisiler', JSON.stringify(this.tumKisiler));
            return true;
        }
        if (!this.emailKullanimdaMi(guncellenmisKisi.mail)) {
            this.tumKisiler.forEach((kisi, index) => {
                if (kisi.mail === mail) {
                    this.tumKisiler[index] = guncellenmisKisi;
                }
            });
            localStorage.setItem('tumKisiler', JSON.stringify(this.tumKisiler));
            return true;
        } else {
            console.log('Guncellerken daha onceden kayitli bir mail kullanilmistir.')
            return false;
        }
    }
    emailKullanimdaMi(mail) {
        const sonuc = this.tumKisiler.find(kisi => {
            return kisi.mail === mail;
        });
        if (sonuc) {    //bu mail daha onceden kullanilmis, listedeki maillerden bir tanesi ile eslesti.
            return true;
        } else {    //bu mail daha onceden kullanilmamis, listede herhangi bir mail ile eslesmedi.
            return false;
        }
    }
}
document.addEventListener('DOMContentLoaded', function (e) {
    const ekran = new Ekran();
});