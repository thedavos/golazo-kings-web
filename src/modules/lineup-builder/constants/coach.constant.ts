import type { SelectOption } from 'src/modules/lineup-builder/types';

export interface CoachSelectOption extends SelectOption {
  photoUrl: string;
  // Campo para identificar entrenadores personalizados
  isCustomEntity?: boolean;
}

export type CoachSelectOptionList = CoachSelectOption[];

export const DEFAULT_OPTION: CoachSelectOption = {
  label: 'Todos los entrenadores',
  value: '',
  photoUrl: '',
};

export const LIST_OPTIONS: CoachSelectOptionList = [
  {
    label: 'Alejandro Castro',
    value: 'alejandro_castro',
    photoUrl: 'https://f002.backblazeb2.com/file/golazo-kings-dev/Coach/alejandro_castro.png',
  },
  {
    label: 'Alex Martinez',
    value: 'alex_martinez',
    photoUrl: 'https://f002.backblazeb2.com/file/golazo-kings-dev/Coach/alex_martinez.png',
  },
  {
    label: 'Alex Solduga',
    value: 'alex_solduga',
    photoUrl: 'https://f002.backblazeb2.com/file/golazo-kings-dev/Coach/alex_solduga.png',
  },
  {
    label: 'Angel Reyna',
    value: 'angel_reyna',
    photoUrl: 'https://f002.backblazeb2.com/file/golazo-kings-dev/Coach/angel_reyna.png',
  },
  {
    label: 'Arnau Jariod',
    value: 'arnau_jariod',
    photoUrl: 'https://f002.backblazeb2.com/file/golazo-kings-dev/Coach/arnau_jariod.png',
  },
  {
    label: 'Dani Romo',
    value: 'dani_romo',
    photoUrl: 'https://f002.backblazeb2.com/file/golazo-kings-dev/Coach/dani_romo.png',
  },
  {
    label: 'David Biosca',
    value: 'david_biosca',
    photoUrl: 'https://f002.backblazeb2.com/file/golazo-kings-dev/Coach/david_biosca.png',
  },
  {
    label: 'David Cabrera',
    value: 'david_cabrera',
    photoUrl: 'https://f002.backblazeb2.com/file/golazo-kings-dev/Coach/david_cabrera.png',
  },
  {
    label: 'Diego Morata',
    value: 'diego_morata',
    photoUrl: 'https://f002.backblazeb2.com/file/golazo-kings-dev/Coach/diego_morata.png',
  },
  {
    label: 'Efren Guillen',
    value: 'efren_guillen',
    photoUrl: 'https://f002.backblazeb2.com/file/golazo-kings-dev/Coach/efren_guillen.png',
  },
  {
    label: 'Enrique Esqueda',
    value: 'enrique_esqueda',
    photoUrl: 'https://f002.backblazeb2.com/file/golazo-kings-dev/Coach/enrique_esqueda.png',
  },
  {
    label: 'Eric Bartra',
    value: 'eric_bartra',
    photoUrl: 'https://f002.backblazeb2.com/file/golazo-kings-dev/Coach/eric_bartra.png',
  },
  {
    label: 'Erik Llorca',
    value: 'erik_llorca',
    photoUrl: 'https://f002.backblazeb2.com/file/golazo-kings-dev/Coach/erik_llorca.png',
  },
  {
    label: 'Fernando Espinosa',
    value: 'fernando_espinosa',
    photoUrl: 'https://f002.backblazeb2.com/file/golazo-kings-dev/Coach/fernando_espinosa.png',
  },
  {
    label: 'Gabriel Cichero',
    value: 'gabriel_cichero',
    photoUrl: 'https://f002.backblazeb2.com/file/golazo-kings-dev/Coach/gabriel_cichero.png',
  },
  {
    label: 'Gabriel Batocletti',
    value: 'gabriel_batocletti',
    photoUrl: 'https://f002.backblazeb2.com/file/golazo-kings-dev/Coach/gabriel_batocletti.png',
  },
  {
    label: 'Gerardo Torrado',
    value: 'gerardo_torrado',
    photoUrl: 'https://f002.backblazeb2.com/file/golazo-kings-dev/Coach/gerardo_torrado.png',
  },
  {
    label: 'Isidro Sanchez',
    value: 'isidro_sanchez',
    photoUrl: 'https://f002.backblazeb2.com/file/golazo-kings-dev/Coach/isidro_sanchez.png',
  },
  {
    label: 'Jacques Passy',
    value: 'jacques_passy',
    photoUrl: 'https://f002.backblazeb2.com/file/golazo-kings-dev/Coach/jacques_passy.png',
  },
  {
    label: 'Joan Compte',
    value: 'joan_compte',
    photoUrl: 'https://f002.backblazeb2.com/file/golazo-kings-dev/Coach/joan_compte.png',
  },
  {
    label: 'Jorge Gonzalez',
    value: 'jorge_gonzalez',
    photoUrl: 'https://f002.backblazeb2.com/file/golazo-kings-dev/Coach/jorge_gonzalez.png',
  },
  {
    label: 'Jos Gartland',
    value: 'jos_gartland',
    photoUrl: 'https://f002.backblazeb2.com/file/golazo-kings-dev/Coach/jos_gartland.png',
  },
  {
    label: 'Jose Manuel Morales',
    value: 'jose_manuel_morales',
    photoUrl: 'https://f002.backblazeb2.com/file/golazo-kings-dev/Coach/jose_manuel_morales.png',
  },
  {
    label: 'Juan Arroita',
    value: 'juan_arroita',
    photoUrl: 'https://f002.backblazeb2.com/file/golazo-kings-dev/Coach/juan_arroita.png',
  },
  {
    label: 'Juan Carlos Cacho',
    value: 'juan_carlos_cacho',
    photoUrl: 'https://f002.backblazeb2.com/file/golazo-kings-dev/Coach/juan_carlos_cacho.png',
  },
  {
    label: 'Juan Manuel Miranda',
    value: 'juan_manuel_miranda',
    photoUrl: 'https://f002.backblazeb2.com/file/golazo-kings-dev/Coach/juan_manuel_miranda.png',
  },
  {
    label: 'Julio Garcia Mera',
    value: 'julio_garcia_mera',
    photoUrl: 'https://f002.backblazeb2.com/file/golazo-kings-dev/Coach/julio_garcia_mera.png',
  },
  {
    label: 'Juvenal Edjogo Owono',
    value: 'juvenal_edjogo_owono',
    photoUrl: 'https://f002.backblazeb2.com/file/golazo-kings-dev/Coach/juvenal_edjogo_owono.png',
  },
  {
    label: 'Lucas Ayala',
    value: 'lucas_ayala',
    photoUrl: 'https://f002.backblazeb2.com/file/golazo-kings-dev/Coach/lucas_ayala.png',
  },
  {
    label: 'Manu Lanzarote',
    value: 'manu_lanzarote',
    photoUrl: 'https://f002.backblazeb2.com/file/golazo-kings-dev/Coach/manu_lanzarote.png',
  },
  {
    label: 'Manuel Fernandez',
    value: 'manuel_fernandez',
    photoUrl: 'https://f002.backblazeb2.com/file/golazo-kings-dev/Coach/manuel_fernandez.png',
  },
  {
    label: 'Mario Otero',
    value: 'mario_otero',
    photoUrl: 'https://f002.backblazeb2.com/file/golazo-kings-dev/Coach/mario_otero.png',
  },
  {
    label: 'Martin Posse',
    value: 'martin_posse',
    photoUrl: 'https://f002.backblazeb2.com/file/golazo-kings-dev/Coach/martin_posse.png',
  },
  {
    label: 'Nacho Castro',
    value: 'nacho_castro',
    photoUrl: 'https://f002.backblazeb2.com/file/golazo-kings-dev/Coach/nacho_castro.png',
  },
  {
    label: 'Narcis Barrera',
    value: 'narcis_barrera',
    photoUrl: 'https://f002.backblazeb2.com/file/golazo-kings-dev/Coach/narcis_barrera.png',
  },
  {
    label: 'Omar Flores',
    value: 'omar_flores',
    photoUrl: 'https://f002.backblazeb2.com/file/golazo-kings-dev/Coach/omar_flores.png',
  },
  {
    label: 'Pol Font',
    value: 'pol_font',
    photoUrl: 'https://f002.backblazeb2.com/file/golazo-kings-dev/Coach/pol_font.png',
  },
  {
    label: 'Rafa Puente',
    value: 'rafa_puente',
    photoUrl: 'https://f002.backblazeb2.com/file/golazo-kings-dev/Coach/rafa_puente.png',
  },
  {
    label: 'Ricardo Ballestin',
    value: 'ricardo_ballestin',
    photoUrl: 'https://f002.backblazeb2.com/file/golazo-kings-dev/Coach/ricardo_ballestin.png',
  },
  {
    label: 'Sergio Fernandez',
    value: 'sergio_fernandez',
    photoUrl: 'https://f002.backblazeb2.com/file/golazo-kings-dev/Coach/sergio_fernandez.png',
  },
  {
    label: 'Sergio Ortega',
    value: 'sergio_ortega',
    photoUrl: 'https://f002.backblazeb2.com/file/golazo-kings-dev/Coach/sergio_ortega.png',
  },
  {
    label: 'Sergio Verdirame',
    value: 'sergio_verdirame',
    photoUrl: 'https://f002.backblazeb2.com/file/golazo-kings-dev/Coach/sergio_verdirame.png',
  },
  {
    label: 'Severo Meza',
    value: 'severo_meza',
    photoUrl: 'https://f002.backblazeb2.com/file/golazo-kings-dev/Coach/severo_meza.png',
  },
  {
    label: 'Victor Chaires',
    value: 'victor_chaires',
    photoUrl: 'https://f002.backblazeb2.com/file/golazo-kings-dev/Coach/victor_chaires.png',
  },
  {
    label: 'Victor Gonzalez',
    value: 'victor_gonzalez',
    photoUrl: 'https://f002.backblazeb2.com/file/golazo-kings-dev/Coach/victor_gonzalez.png',
  },
];
