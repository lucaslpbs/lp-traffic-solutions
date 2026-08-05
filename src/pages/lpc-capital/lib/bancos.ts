import bancoBmg from '../assets/bancos/banco-bmg.png';
import daycoval from '../assets/bancos/daycoval.png';
import brb from '../assets/bancos/brb-2.png';
import bancoDoBrasil from '../assets/bancos/banco-do-brasil.png';
import safra from '../assets/bancos/safra.png';
import btgPactual from '../assets/bancos/btg-pactual.png';
import c6Bank from '../assets/bancos/c6-bank.png';
import caixa from '../assets/bancos/caixa.png';
import inter from '../assets/bancos/inter.png';
import itau from '../assets/bancos/itau.png';
import iti from '../assets/bancos/iti.png';
import mercadoPago from '../assets/bancos/mercado-pago.png';
import nubank from '../assets/bancos/nubank.png';
import paranaBanco from '../assets/bancos/parana-banco.png';
import santander from '../assets/bancos/santander.png';
import sicoob from '../assets/bancos/sicoob.png';
import sicredi from '../assets/bancos/sicredi.png';
import galleriaBank from '../assets/bancos/galleria-bank.png';
import cashme from '../assets/bancos/cashme.png';
import tCash from '../assets/bancos/t-cash.png';
import wimo from '../assets/bancos/wimo.png';
import pontte from '../assets/bancos/pontte.png';
import trisul from '../assets/bancos/trisul.png';
import creditas from '../assets/bancos/creditas.png';
import bancoBari from '../assets/bancos/banco-bari.png';
import libraCredito from '../assets/bancos/libra-credito.png';

export interface BancoParceiro {
  nome: string;
  logo: string;
}

// Logos reais dos parceiros, hospedados originalmente no site institucional da LPC.
export const BANCOS_PARCEIROS: BancoParceiro[] = [
  { nome: 'Banco BMG', logo: bancoBmg },
  { nome: 'Daycoval', logo: daycoval },
  { nome: 'BRB', logo: brb },
  { nome: 'Banco do Brasil', logo: bancoDoBrasil },
  { nome: 'Safra', logo: safra },
  { nome: 'BTG Pactual', logo: btgPactual },
  { nome: 'C6 Bank', logo: c6Bank },
  { nome: 'Caixa Econômica Federal', logo: caixa },
  { nome: 'Inter', logo: inter },
  { nome: 'Itaú Unibanco', logo: itau },
  { nome: 'Iti', logo: iti },
  { nome: 'Mercado Pago', logo: mercadoPago },
  { nome: 'Nubank', logo: nubank },
  { nome: 'Paraná Banco', logo: paranaBanco },
  { nome: 'Santander', logo: santander },
  { nome: 'Sicoob', logo: sicoob },
  { nome: 'Sicredi', logo: sicredi },
  { nome: 'Galleria Bank', logo: galleriaBank },
  { nome: 'CashMe', logo: cashme },
  { nome: 't-cash', logo: tCash },
  { nome: 'wimo', logo: wimo },
  { nome: 'Pontte', logo: pontte },
  { nome: 'Trisul', logo: trisul },
  { nome: 'Creditas', logo: creditas },
  { nome: 'Banco Bari', logo: bancoBari },
  { nome: 'Libra Crédito', logo: libraCredito },
];
