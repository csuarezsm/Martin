/* Martín: Los Caminos del Volcán — Cuaderno de viaje
   Una ficha divulgativa por nivel. Los datos están contrastados en fuentes oficiales
   (Gobierno de Canarias, Cabildo de Lanzarote, ayuntamientos, MITECO, universidades públicas, RTVC).
   © 2026 IT Canarias. Todos los derechos reservados. */
(function () {
  window.LUGARES = [
    {
      lugar: 'Uga', titulo: 'El pueblo de los camellos', img: 'paisaje-uga.jpg', pos: '60% 40%',
      texto: [
        'Uga es un pequeño pueblo del municipio de Yaiza, en el sur de Lanzarote.',
        'En una isla donde casi no llueve, cada gota cuenta: en Uga los tejados se hacían inclinados para llevar el agua de lluvia a un aljibe.',
        'Hoy en Uga viven unos 400 camellos. Al amanecer salen en fila india, detrás del camellero y del camello guía, hacia el Echadero de los Camellos de Timanfaya, a hora y media de camino. Los primeros paseos a lomo de camello se hicieron en los años cincuenta.'
      ],
      dato: 'De los paseos en camello por Timanfaya viven unas cuarenta familias de Uga. El camello llegó a la isla para el trabajo del campo.',
      extra: ['En verano el trabajo se multiplica: por el sendero del Echadero pueden pasar hasta 150 camellos al día.', ['Ayuntamiento de Yaiza: el sendero de los camellos', 'https://yaiza.es/yaiza-acondiciona-el-sendero-de-los-camellos-en-el-parque-natural-de-los-volcanes/']],
      fuentes: [
        ['Ayuntamiento de Yaiza: el sendero de los camellos', 'https://yaiza.es/yaiza-acondiciona-el-sendero-de-los-camellos-en-el-parque-natural-de-los-volcanes/'],
        ['Ayuntamiento de Yaiza: los paseos a camello en Timanfaya', 'https://yaiza.es/yaiza-promueve-la-declaracion-de-los-paseos-a-camello-en-timanfaya-como-patrimonio-de-interes-social-y-cultural/'],
        ['MITECO: folleto del Parque Nacional de Timanfaya', 'https://www.miteco.gob.es/content/dam/miteco/es/parques-nacionales-oapn/red-parques-nacionales/parques-nacionales/timanfaya/guia-visitante/timanfaya-folleto-espa%C3%B1ol.pdf']
      ]
    },
    {
      lugar: 'Tiagua y Teguise', titulo: 'Los molinos de gofio', img: 'paisaje.jpg', pos: '85% 30%',
      texto: [
        'El gofio fue el alimento básico de la gente de Lanzarote, y los molinos de viento, la industria que lo producía. Se hace moliendo grano: millo, trigo, cebada o garbanzos.',
        'El molino típico de Lanzarote es una torre de planta circular: es la construcción más característica de la producción de cereales en la isla. El antiguo molino de La Villa de Teguise, del siglo XIX, tiene dos pisos.',
        'Aún se conservan varios: en Tiagua hay un molino que se levanta desde el siglo XVIII y se ha restaurado hace poco, y en Teguise se ha recuperado el molino de La Mareta.'
      ],
      dato: 'En San Bartolomé, el molino de José María Gil, una torre de tres pisos del siglo XIX, sigue moliendo gofio, hoy con motor.',
      extra: ['El antiguo molino de La Villa de Teguise, en la calle Gadifer de La Salle, se está rehabilitando: tiene puertas y ventanas enmarcadas en piedra y un balcón en el piso de arriba.', ['Ayuntamiento de Teguise: el antiguo molino de La Villa', 'https://teguise.es/teguise-avanza-en-su-estrategia-de-recuperacion-del-patrimonio-de-uno-de-los-conjuntos-historicos-con-mas-proyeccion-de-canarias/']],
      fuentes: [
        ['Ayuntamiento de Teguise: el antiguo molino de La Villa', 'https://teguise.es/teguise-avanza-en-su-estrategia-de-recuperacion-del-patrimonio-de-uno-de-los-conjuntos-historicos-con-mas-proyeccion-de-canarias/'],
        ['Turismo Lanzarote: molinos del interior de la isla', 'https://turismolanzarote.com/en/fire-and-wind-discovering-the-rural-heart-of-lanzarote/']
      ]
    },
    {
      lugar: 'Timanfaya', titulo: 'Las Montañas del Fuego', img: 'paisaje-timanfaya.jpg', pos: '30% 40%',
      texto: [
        'La noche del 1 de septiembre de 1730, entre las nueve y las diez, la tierra se abrió de pronto cerca de Timanfaya, a dos leguas de Yaiza. Las erupciones siguieron hasta 1736.',
        'Las erupciones afectaron a unos 174 km², una cuarta parte de la isla. La lava destruyó pueblos como Maretas y Santa Catalina, y cubrió el de Mazo.',
        'En 1974 el corazón de aquel paisaje se declaró Parque Nacional de Timanfaya, con 51 km². Bajo el suelo el volcán sigue caliente: a 13 metros de profundidad se han medido 610 °C.'
      ],
      dato: 'Tres siglos después, las coladas de lava siguen enfriándose y «encogen» unos 0,6 cm al año.',
      extra: ['En el restaurante El Diablo, en plenas Montañas del Fuego, se cocina con el calor que sale del volcán.', ['Gobierno de Canarias: historia volcánica de Lanzarote', 'https://www3.gobiernodecanarias.org/medusa/wiki/index.php?title=Historia_volc%C3%A1nica_de_Lanzarote']],
      fuentes: [
        ['MITECO: historia del Parque Nacional de Timanfaya', 'https://www.miteco.gob.es/en/parques-nacionales-oapn/red-parques-nacionales/parques-nacionales/timanfaya/historia.html'],
        ['MITECO: guía de visita del Parque Nacional de Timanfaya', 'https://www.miteco.gob.es/content/dam/miteco/es/parques-nacionales-oapn/red-parques-nacionales/parques-nacionales/guia-timanfaya_tcm30-67887.pdf'],
        ['RTVC: las lavas de Timanfaya siguen enfriando', 'https://rtvc.es/las-lavas-de-timanfaya-encogen-06-cm-al-ano/']
      ]
    },
    {
      lugar: 'La Geria', titulo: 'Viñas en la ceniza', img: 'paisaje-geria.jpg', pos: '55% 50%',
      texto: [
        'Las erupciones de Timanfaya, entre 1730 y 1736, cubrieron estas tierras con una gruesa capa de ceniza volcánica: el picón.',
        'Para plantar las parras se excava la capa de picón, de unos dos metros y medio, hasta llegar a la tierra que quedó enterrada. El hoyo suele protegerse del viento con un pequeño muro de piedra.',
        'La tierra volcánica absorbe y conserva la humedad en una isla donde casi no llueve. La variedad de uva más abundante es la malvasía. Fue declarada Parque Natural en 1987 y hoy es Paisaje Protegido, con 5.255 hectáreas.'
      ],
      dato: 'Cada hoyo mide unos 3 metros de diámetro, y en una hectárea caben hasta 350, según lo profundos que sean.',
      extra: ['En plena Geria está el Volcán del Cuervo, el primero de las erupciones de Timanfaya. Hoy se puede entrar a pie en su cráter por un sendero señalizado de alrededor de una hora.', ['Lanzarote Film Commission (Turismo Lanzarote): ruta de Timanfaya', 'https://film.turismolanzarote.com/en/film-destination/cinema-routes/timanfaya-a-volcano-of-film/']],
      fuentes: [
        ['Gobierno de Canarias: La Geria', 'https://www3.gobiernodecanarias.org/medusa/wiki/index.php?title=La_Geria'],
        ['BOC: Plan Especial del Paisaje Protegido de La Geria', 'https://www.gobiernodecanarias.org/boc/2010/235/003.html']
      ]
    },
    {
      lugar: 'Los Hervideros', titulo: 'Donde el mar hierve', img: 'paisaje-costa.jpg', pos: '60% 50%',
      texto: [
        'Los Hervideros son un tramo de acantilados en la costa de Yaiza, en el suroeste de Lanzarote.',
        'Se formaron con las erupciones de 1730-1736: es una costa de acantilados con cuevas y bufaderos, que el mar sigue erosionando con fuerza.',
        'Las olas rompen contra el acantilado y se arremolinan entre las cuevas. El agua parece hervir entre las rocas, y de ahí viene su nombre.'
      ],
      dato: 'El espectáculo es mayor con la marea alta.',
      extra: ['La última erupción histórica de Lanzarote fue en 1824, en la fisura de Tao, casi cien años después de que acabara la de Timanfaya.', ['Gobierno de Canarias: historia volcánica de Lanzarote', 'https://www3.gobiernodecanarias.org/medusa/wiki/index.php?title=Historia_volc%C3%A1nica_de_Lanzarote']],
      fuentes: [
        ['Ayuntamiento de Yaiza: lugares de interés', 'https://yaiza.es/lugares-de-interes/'],
        ['Hola Islas Canarias: Mirador de Los Hervideros', 'https://www.hellocanaryislands.com/viewpoints/lanzarote/los-hervideros-viewpoint/'],
        ['Turismo Lanzarote: Yaiza', 'https://turismolanzarote.com/en/yaiza/']
      ]
    },
    {
      lugar: 'Teguise', titulo: 'La antigua capital', img: 'paisaje-ocaso.jpg', pos: '50% 40%',
      texto: [
        'La Villa de Teguise la fundó a mediados del siglo XV Maciot de Béthencourt, sobre la antigua aldea aborigen de Acatife, o Gran Aldea. Su nombre recuerda a la hija de Guadarfía, el último rey aborigen.',
        'Fue la capital de Lanzarote hasta 1852, cuando la capitalidad pasó a Arrecife. Atrajo a los piratas, que la saquearon varias veces; en la montaña de Guanapay se levantó el castillo de Santa Bárbara.',
        'Su casco histórico está declarado conjunto arquitectónico-histórico-artístico.'
      ],
      dato: 'Cada domingo por la mañana, el casco histórico de Teguise se llena con su mercadillo.',
      extra: ['Los artesanos de la Villa de Teguise ayudaron a llevar el timple, la pequeña guitarra canaria, al resto de las islas. En la plaza hay una casa-museo dedicada a él.', ['Turismo Lanzarote: Teguise, la historia a la sombra del Risco', 'https://turismolanzarote.com/en/teguise-history-in-the-shadow-of-the-risco/']],
      fuentes: [
        ['Turismo Lanzarote: Teguise', 'https://turismolanzarote.com/en/teguise/'],
        ['Ayuntamiento de Teguise: el Conjunto Histórico', 'https://teguise.es/wp-content/uploads/2015/09/teguise-conjunto-historico-artistico.pdf'],
        ['ULPGC: el municipio de Teguise', 'https://www.dis.ulpgc.es/canarias/lanzarote/teguise.html'],
        ['Turismo Lanzarote: Teguise, historia a la sombra del risco', 'https://turismolanzarote.com/en/teguise-history-in-the-shadow-of-the-risco/']
      ]
    },
    {
      lugar: 'El Golfo', titulo: 'La laguna verde', img: 'paisaje-golfo.jpg', pos: '35% 60%',
      texto: [
        'Junto al pueblo pesquero de El Golfo, en la costa de Yaiza, queda la mitad del cráter de un volcán de las erupciones de 1730-1736: el mar ha ido erosionando la otra mitad.',
        'Dentro hay una laguna, el Charco de los Clicos o Charco Verde, unida al mar por grietas bajo tierra. Una playa de arena negra de unos 300 metros la separa del océano. Su color verde se debe a la gran cantidad de organismos vegetales que flotan en el agua.',
        'Está dentro del Parque Natural de Los Volcanes y es reserva natural: está prohibido bañarse en la laguna y en la playa.'
      ],
      dato: 'Se llama «de los Clicos» por un pequeño marisco, el clico, que vivía allí y desapareció después de que soltaran dos tortugas en sus aguas.',
      extra: ['El paisaje del Charco de los Clicos ha servido de decorado para 14 películas.', ['Lanzarote Film Commission (Turismo Lanzarote): ruta de Timanfaya', 'https://film.turismolanzarote.com/en/film-destination/cinema-routes/timanfaya-a-volcano-of-film/']],
      fuentes: [
        ['Ayuntamiento de Yaiza: el Charco de los Clicos', 'https://yaiza.es/lugares-de-interes/'],
        ['Gobierno de Canarias: El Golfo', 'https://www3.gobiernodecanarias.org/medusa/wiki/index.php?title=El_Golfo'],
        ['Hola Islas Canarias: Mirador de El Golfo', 'https://www.hellocanaryislands.com/viewpoints/lanzarote/el-golfo-viewpoint/']
      ]
    },
    {
      lugar: 'Salinas de Janubio', titulo: 'El jardín de sal', img: 'paisaje-janubio.jpg', pos: '45% 70%',
      texto: [
        'En la costa de Yaiza están las salinas más grandes de Canarias. Empezaron a funcionar como salinas en 1895, y hoy las sigue trabajando la misma familia.',
        'Las erupciones de 1730-1736 cerraron una antigua bahía y así se formó la laguna de Janubio. En los estanques, el agua de mar se evapora con el calor hasta que solo queda la sal.',
        'La sal estaba muy unida a la pesca: con ella se salaba el pescado para conservarlo.'
      ],
      dato: 'Las salinas toman un color rojizo por un pequeño crustáceo, la artemia, y por un alga, Dunaliella salina. Además, son refugio de muchas aves de orilla.',
      extra: ['En Lanzarote se han visto más de 190 especies de aves migratorias, y las salinas de Janubio son una de las zonas de mayor interés de Canarias para observar aves de orilla.', ['Ayuntamiento de Yaiza: datos generales', 'https://yaiza.es/datos-generales/']],
      fuentes: [
        ['Gobierno de Canarias: Salinas del Janubio', 'https://www3.gobiernodecanarias.org/medusa/wiki/index.php?title=Salinas_del_Janubio'],
        ['Ayuntamiento de Yaiza: Sitio de Interés Científico del Janubio', 'https://yaiza.es/lugares-de-interes/'],
        ['Turismo Lanzarote: Yaiza', 'https://turismolanzarote.com/en/yaiza/']
      ]
    },
    {
      lugar: 'Famara', titulo: 'El gran risco', img: 'paisaje-famara.jpg', pos: '40% 40%',
      texto: [
        'El Risco de Famara es un enorme acantilado de unos 22 kilómetros en el norte de Lanzarote. Su altura media ronda los 400 metros.',
        'Es una de las zonas más antiguas de la isla. Su punto más alto, las Peñas del Chache, con unos 671 metros, es también el techo de Lanzarote.',
        'A sus pies se extiende la playa de Famara, de casi 6 km, junto al pueblo de La Caleta, de calles de arena. Es famosa por sus atardeceres y entre los surfistas.'
      ],
      dato: 'Entre el Risco de Famara y los pueblos de Soo y Muñique se extiende El Jable, un manto de arenas de origen marino de unos cuatro kilómetros de ancho.',
      extra: ['El director de cine Pedro Almodóvar rodó en Famara algunas escenas de su película «Los abrazos rotos».', ['Turismo Lanzarote: Teguise, la historia a la sombra del Risco', 'https://turismolanzarote.com/en/teguise-history-in-the-shadow-of-the-risco/']],
      fuentes: [
        ['Gobierno de Canarias: Isla de Lanzarote', 'https://www3.gobiernodecanarias.org/medusa/wiki/index.php?title=Isla_de_Lanzarote'],
        ['Gobierno de Canarias: historia volcánica de Lanzarote', 'https://www3.gobiernodecanarias.org/medusa/wiki/index.php?title=Historia_volc%C3%A1nica_de_Lanzarote'],
        ['Turismo Lanzarote: El Jable', 'https://turismolanzarote.com/en/el-jable-lanzarotes-secret-treasure/']
      ]
    },
    {
      lugar: 'Haría', titulo: 'El valle de las mil palmeras', img: 'paisaje-haria.jpg', pos: '60% 50%',
      texto: [
        'Haría es un pueblo de casas blancas en un valle del norte de Lanzarote. Lo llaman «el valle de las mil palmeras» por su palmeral, donde las palmeras se alternan con higueras y tuneras.',
        'Con las hojas de palma se tejían esteras, y los cesteros hacían con ellas cestas.',
        'César Manrique se instaló en una casa de campo de Haría en 1986 y vivió allí hasta su muerte, seis años después. Desde 2013 es casa-museo.'
      ],
      dato: 'Cada sábado por la mañana, la plaza de Haría acoge un mercado de artesanía.',
      extra: ['Hace mucho, en Haría y sus valles llegó a haber unas 10.000 palmeras. Hoy quedan unas 3.000.', ['Ayuntamiento de Haría: la palmera en Haría', 'https://www.ayuntamientodeharia.com/haria/el-mirador-de-guatifay-4/']],
      fuentes: [
        ['Turismo Lanzarote: Haría, del palmeral al malpaís', 'https://turismolanzarote.com/en/haria-from-the-leafy-palm-grove-to-the-volcanic-badlands/'],
        ['Ayuntamiento de Haría: la palmera en Haría', 'https://www.ayuntamientodeharia.com/haria/el-mirador-de-guatifay-4/'],
        ['Hola Islas Canarias: el pueblo de Haría', 'https://www.hellocanaryislands.com/places-full-of-charm/lanzarote/the-village-of-haria/']
      ]
    },
    {
      lugar: 'Mirador del Río', titulo: 'El balcón sobre La Graciosa', img: 'paisaje-mirador.jpg', pos: '70% 40%',
      texto: [
        'En lo alto del Risco de Famara, a 474 metros sobre el mar, César Manrique construyó entre 1971 y 1973 el Mirador del Río, con Eduardo Cáceres y Jesús Soto.',
        'Desde fuera apenas se distingue: son dos cúpulas enterradas en el risco, para que se note lo menos posible. Por dentro, dos grandes ventanales miran a El Río, el brazo de mar que separa Lanzarote de La Graciosa.',
        'Desde allí se ven La Graciosa y los islotes del Archipiélago Chinijo. Todo su entorno es espacio natural protegido.'
      ],
      dato: 'Manrique aprovechó una antigua posición de artillería de costa, las Baterías del Río, levantada durante la guerra entre España y Estados Unidos.',
      extra: ['Al entrar, recibe al visitante una escultura de hierro de Manrique con un pez y un ave: el agua y el aire que rodean el mirador.', ['Gobierno de Canarias: El Mirador del Río', 'https://www3.gobiernodecanarias.org/medusa/wiki/index.php?title=El_Mirador_del_R%C3%ADo']],
      fuentes: [
        ['CACT Lanzarote (Cabildo): Mirador del Río', 'https://cactlanzarote.com/centro/mirador-del-rio-2/'],
        ['Turismo Lanzarote: César Manrique, 100 años', 'https://turismolanzarote.com/en/cesar-manrique-100-years-since-his-birth/'],
        ['Gobierno de Canarias: El Mirador del Río', 'https://www3.gobiernodecanarias.org/medusa/wiki/index.php?title=El_Mirador_del_R%C3%ADo']
      ]
    },
    // Niveles secretos (se abren con todos los frutos de su mundo)
    {
      lugar: 'Cueva de los Verdes', titulo: 'Un túnel hecho por la lava', img: 'paisaje-cueva.jpg', pos: '50% 40%',
      texto: [
        'La Cueva de los Verdes está en el norte de Lanzarote, dentro del malpaís que dejó el volcán de La Corona.',
        'Se formó cuando el volcán de La Corona entró en erupción: la lava corrió hacia el mar y se enfrió por fuera, mientras seguía fluyendo por dentro. Al vaciarse, dejó un tubo hueco de más de siete kilómetros.',
        'En los siglos XVI y XVII la gente de la isla se escondía en sus galerías para huir de los piratas. Se cuenta que su nombre viene de una familia apellidada Los Verdes que guardaba su ganado en la zona.'
      ],
      dato: 'El último tramo del tubo sigue por debajo del mar: se llama el Túnel de la Atlántida.',
      extra: ['La cueva se abrió a las visitas en 1964, preparada por el artista Jesús Soto. Dentro hay hasta un auditorio donde se dan conciertos.', ['CACT Lanzarote (Cabildo): viaje al corazón de los volcanes', 'https://cactlanzarote.com/la-cueva-de-los-verdes-viaje-al-corazon-de-los-volcanes/']],
      fuentes: [
        ['CACT Lanzarote (Cabildo): Cueva de los Verdes', 'https://cactlanzarote.com/en/visit/cueva-de-los-verdes'],
        ['Gobierno de Canarias: Cueva de los Verdes', 'https://www3.gobiernodecanarias.org/medusa/wiki/index.php?title=Cueva_de_los_Verdes'],
        ['Gobierno de Canarias: Malpaís de La Corona', 'https://www3.gobiernodecanarias.org/medusa/wiki/index.php?title=Malpa%C3%ADs_de_La_Corona']
      ]
    },
    {
      lugar: 'La Graciosa', titulo: 'La octava isla', img: 'paisaje-mirador.jpg', pos: '78% 45%',
      texto: [
        'La Graciosa está al norte de Lanzarote, al otro lado de El Río, un brazo de mar de apenas un kilómetro. Mide unos 27 km², su punto más alto, Agujas Grandes, tiene 266 metros, y pertenece al municipio de Teguise.',
        'Es uno de los pocos lugares habitados de Europa sin carreteras asfaltadas: sus calles son de arena y se puede andar descalzo.',
        'Hasta 2018 se la consideraba un islote. Ese año se reconoció como la octava isla habitada de Canarias.'
      ],
      dato: 'Solo se puede llegar en barco, desde el puerto de Órzola, en el norte de Lanzarote.',
      extra: ['Casi toda la isla, menos los pueblos de Caleta de Sebo y Pedro Barba, pertenece al Patrimonio Nacional.', ['Gobierno de Canarias: La Graciosa, la octava isla', 'https://www3.gobiernodecanarias.org/medusa/ecoescuela/recursosdigitales/2023/06/02/la-graciosa/']],
      fuentes: [
        ['Gobierno de Canarias: La Graciosa', 'https://www3.gobiernodecanarias.org/medusa/ecoescuela/recursosdigitales/2023/06/02/la-graciosa/'],
        ['Gobierno de Canarias: Isla de La Graciosa', 'https://www3.gobiernodecanarias.org/medusa/wiki/index.php?title=Isla_de_La_Graciosa'],
        ['Turismo Lanzarote: folleto del Archipiélago Chinijo', 'https://turismolanzarote.com/wp-content/uploads/2017/01/Folleto-La-Graciosa-Archipi%C3%A9lago-Chinijo-Teguise.pdf']
      ]
    }
  ];

  // Mundo 3 (3.0): fichas de los niveles 3-1, 3-3, 3-4 y del nivel secreto. Los niveles 3-2, 3-5, 3-6 y el de premio no tienen ficha
  // (la del eclipse espera a tener los datos de Lanzarote del Instituto Geográfico Nacional).
  const L3 = [
    {
      lugar: 'Uga', titulo: 'El guelfo', img: 'paisaje-uga.jpg', pos: '40% 45%',
      texto: [
        'En Canarias, a la cría del camello, desde que nace hasta que deja de mamar, se le llama guelfo.',
        'El camello canario es una raza propia: el Catálogo Oficial de Razas de Ganado de España la clasifica como raza autóctona en peligro de extinción.',
        'Hay un programa de conservación para evitar que desaparezca la raza, y cada año se celebran jornadas técnicas con los Criadores de Camello Canario, por ejemplo para planificar los apareamientos.'
      ],
      dato: 'En la isla, el camello fue una herramienta básica para trabajar los campos y para llevar personas y mercancías.',
      fuentes: [
        ['RAE, Diccionario histórico del español de Canarias: guelfo', 'https://www.rae.es/tdhle/guelfo'],
        ['Ministerio de Agricultura: raza Camello Canario', 'https://www.mapa.gob.es/en/ganaderia/temas/zootecnia/razas-ganaderas/arca/logotipo-camello-canario'],
        ['Ayuntamiento de Yaiza: los paseos a camello en Timanfaya', 'https://yaiza.es/yaiza-promueve-la-declaracion-de-los-paseos-a-camello-en-timanfaya-como-patrimonio-de-interes-social-y-cultural/']
      ]
    },
    null,
    {
      lugar: 'El Vallito de Uga', titulo: 'Donde vive la manada', img: 'paisaje-uga.jpg', pos: '75% 55%',
      texto: [
        'La cabaña camellar de Uga tiene unos cuatrocientos animales.',
        'Desde el Vallito de Uga sale cada mañana la manada hacia el Echadero de los Camellos de Timanfaya. El traslado de los animales tarda hora y media.'
      ],
      dato: 'El camino que va del Vallito de Uga al Echadero lo cuida el Ayuntamiento de Yaiza: empezó a mejorarlo en diciembre de 2015.',
      fuentes: [['Ayuntamiento de Yaiza: el sendero de los camellos', 'https://yaiza.es/yaiza-acondiciona-el-sendero-de-los-camellos-en-el-parque-natural-de-los-volcanes/']]
    },
    {
      lugar: 'El sendero de los camellos', titulo: 'La fila del amanecer', img: 'fila-amanecer.jpg', pos: '30% 50%',
      texto: [
        'Al amanecer, los camellos van al trabajo en fila india, encabezada por el camellero y el camello guía.',
        'El sendero va por el Parque Natural de Los Volcanes, entre el Vallito de Uga y el Echadero de los Camellos de Timanfaya.'
      ],
      dato: 'Por el sendero pasan cada día entre ochenta y cien camellos en invierno, y en verano, hasta ciento cincuenta.',
      fuentes: [['Ayuntamiento de Yaiza: el sendero de los camellos', 'https://yaiza.es/yaiza-acondiciona-el-sendero-de-los-camellos-en-el-parque-natural-de-los-volcanes/']]
    },
    null, null,
    {
      lugar: 'El Echadero', titulo: 'Los paseos en camello', img: 'caravana-paseo.jpg', pos: '30% 50%',
      texto: [
        'En Timanfaya, los camellos de Uga pasean a los visitantes: es la actividad turística del sector camellar.',
        'Los primeros paseos a lomo de camello fueron en los años cincuenta.'
      ],
      dato: 'De los paseos en camello por Timanfaya viven cuarenta familias del pueblo de Uga. El Ayuntamiento de Yaiza promueve que se declaren patrimonio de interés social y cultural.',
      fuentes: [
        ['Ayuntamiento de Yaiza: los paseos a camello en Timanfaya', 'https://yaiza.es/yaiza-promueve-la-declaracion-de-los-paseos-a-camello-en-timanfaya-como-patrimonio-de-interes-social-y-cultural/'],
        ['Ayuntamiento de Yaiza: el sendero de los camellos', 'https://yaiza.es/yaiza-acondiciona-el-sendero-de-los-camellos-en-el-parque-natural-de-los-volcanes/']
      ]
    },
    null
  ];
  for (const f of L3) window.LUGARES.push(f);
})();
