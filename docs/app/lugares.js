/* Martín: Los Caminos del Volcán — Cuaderno de viaje
   Una ficha divulgativa por nivel. Los datos están contrastados en fuentes oficiales
   (Gobierno de Canarias, Cabildo de Lanzarote, ayuntamientos, MITECO, universidades públicas, RTVC).
   © 2026 IT Canarias. Todos los derechos reservados. */
(function () {
  window.LUGARES = [
    {
      lugar: 'Uga', titulo: 'El pueblo de los camellos', img: 'paisaje-uga.jpg', pos: '60% 40%',
      texto: [
        'Uga es un pequeño pueblo de casas blancas del municipio de Yaiza, en el sur de Lanzarote, a las puertas del Parque Nacional de Timanfaya.',
        'En una isla donde casi no llueve, cada gota cuenta: en Uga los tejados se hacían inclinados para llevar el agua de lluvia a un aljibe.',
        'Hoy en Uga viven unos 400 dromedarios. Cada mañana salen en fila india hacia el Echadero de los Camellos de Timanfaya, a hora y media de camino, donde pasean a los visitantes desde los años cincuenta.'
      ],
      dato: 'De los paseos en camello por Timanfaya viven unas cuarenta familias de Uga. El dromedario llegó a la isla para el trabajo del campo.',
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
        'Durante siglos, el alimento básico de la gente de Lanzarote fue el gofio: harina de cereales tostados. Los molinos de viento eran la industria que lo hacía posible.',
        'El molino clásico es una torre de planta circular, de dos pisos y techo cónico. El viento mueve las aspas y, mediante engranajes de madera, hace girar dos piedras muy duras que muelen el grano.',
        'Junto a estos molinos de torre se levantaron también las molinas, más ligeras. Aún pueden verse en Teguise, en Tiagua, donde la finca de El Patio conserva su molino, y en San Bartolomé.'
      ],
      dato: 'En San Bartolomé, el molino de José María Gil es Bien de Interés Cultural y todavía muele gofio.',
      extra: ['El molino de José María Gil, en San Bartolomé, se construyó en 1870. Por dentro tiene tres pisos: arriba se echaba el grano y en medio salía el gofio.', ['Ayuntamiento de San Bartolomé: patrimonio cultural', 'https://eadmin.sanbartolome.es/transparencia/indice/indicador/GCAN/6']],
      fuentes: [
        ['Turismo de Teguise (Ayuntamiento): el molino', 'https://turismoteguise.com/es/molino.php'],
        ['Ayuntamiento de Teguise: el antiguo molino de La Villa', 'https://teguise.es/teguise-avanza-en-su-estrategia-de-recuperacion-del-patrimonio-de-uno-de-los-conjuntos-historicos-con-mas-proyeccion-de-canarias/'],
        ['Turismo Lanzarote: molinos del interior de la isla', 'https://turismolanzarote.com/en/fire-and-wind-discovering-the-rural-heart-of-lanzarote/']
      ]
    },
    {
      lugar: 'Timanfaya', titulo: 'Las Montañas del Fuego', img: 'paisaje-timanfaya.jpg', pos: '30% 40%',
      texto: [
        'La noche del 1 de septiembre de 1730, entre las nueve y las diez, la tierra se abrió cerca de Timanfaya, a casi 10 km de Yaiza. Así empezó la erupción más larga de la historia de Canarias: duró casi seis años, hasta abril de 1736.',
        'La lava cubrió unos 174 km², casi una cuarta parte de la isla, y sepultó pueblos, cultivos y caminos.',
        'En 1974 el corazón de aquel paisaje se declaró Parque Nacional de Timanfaya, con 5.107 hectáreas. Bajo el suelo el volcán sigue caliente: a 13 metros de profundidad la roca está a unos 600 °C.'
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
        'Las erupciones de 1730-1736 enterraron bajo metros de ceniza volcánica, el picón, algunas de las tierras más fértiles de la isla.',
        'Los agricultores excavaron a mano hoyos en el picón hasta llegar a la tierra y plantaron una o pocas cepas en cada uno. Para frenar el viento levantaron pequeños muros semicirculares de piedra, los zocos.',
        'El picón guarda la humedad en una isla donde casi no llueve. Así nació la malvasía volcánica, la uva más cultivada de La Geria. Se protegió en 1987 y hoy es Paisaje Protegido, con más de 5.200 hectáreas.'
      ],
      dato: 'En algunos puntos la capa de picón llega a los 3 metros de espesor, y en una hectárea caben hasta 350 hoyos.',
      extra: ['En plena Geria está el Volcán del Cuervo, el primero que entró en erupción en 1730. Hoy se puede entrar a pie en su cráter por un sendero señalizado.', ['Lanzarote Film Commission (Turismo Lanzarote): ruta de Timanfaya', 'https://film.turismolanzarote.com/en/film-destination/cinema-routes/timanfaya-a-volcano-of-film/']],
      fuentes: [
        ['Gobierno de Canarias: La Geria', 'https://www3.gobiernodecanarias.org/medusa/wiki/index.php?title=La_Geria'],
        ['Cabildo de Lanzarote: ficha técnica del cultivo de la vid', 'https://www.cabildodelanzarote.com/documents/35307/78425/ficha_tecnica_del_cultivo_de_la_vid.pdf/3928871f-28d8-f2f2-d7a5-c9505b2afa16?t=1620735957625'],
        ['BOC: Plan Especial del Paisaje Protegido de La Geria', 'https://www.gobiernodecanarias.org/boc/2010/235/003.html']
      ]
    },
    {
      lugar: 'Los Hervideros', titulo: 'Donde el mar hierve', img: 'paisaje-costa.jpg', pos: '60% 50%',
      texto: [
        'Los Hervideros están en la costa de Yaiza, entre las Salinas de Janubio y El Golfo.',
        'Se formaron cuando la lava de las erupciones de 1730-1736 llegó al Atlántico: al enfriarse de golpe creó acantilados, cuevas y arcos de roca, que el mar sigue esculpiendo.',
        'Con oleaje, las olas entran en las cuevas y salen a presión entre las rocas. El agua parece hervir, y de ahí viene su nombre.'
      ],
      dato: 'Las lavas de Timanfaya que llegaron al mar hicieron crecer la isla hacia el oeste.',
      extra: ['La última erupción de Lanzarote fue en 1824, casi cien años después de la de Timanfaya.', ['Turismo Lanzarote: Yaiza', 'https://turismolanzarote.com/en/yaiza/']],
      fuentes: [
        ['Ayuntamiento de Yaiza: lugares de interés', 'https://yaiza.es/lugares-de-interes/'],
        ['Hola Islas Canarias: Mirador de Los Hervideros', 'https://www.hellocanaryislands.com/viewpoints/lanzarote/los-hervideros-viewpoint/'],
        ['Turismo Lanzarote: Yaiza', 'https://turismolanzarote.com/en/yaiza/']
      ]
    },
    {
      lugar: 'Teguise', titulo: 'La antigua capital', img: 'paisaje-ocaso.jpg', pos: '50% 40%',
      texto: [
        'La Villa de Teguise la fundó en el siglo XV Maciot de Béthencourt, sobre la antigua aldea aborigen de Acatife. Según la tradición, su nombre recuerda a la princesa Teguise, hija del rey Guadarfía.',
        'Fue la capital de Lanzarote hasta 1852, cuando la capitalidad pasó a Arrecife. Su riqueza atrajo a los piratas, que la saquearon varias veces; para defenderla se levantó el castillo de Santa Bárbara, en la montaña de Guanapay.',
        'Su casco histórico, de casas blancas y casonas nobles, está declarado conjunto histórico-artístico.'
      ],
      dato: 'Cada domingo por la mañana, el casco histórico de Teguise se llena con su mercadillo.',
      extra: ['Los artesanos de la Villa de Teguise ayudaron a llevar el timple, la pequeña guitarra canaria, al resto de las islas. En la plaza hay una casa-museo dedicada a él.', ['Turismo Lanzarote: Teguise, la historia a la sombra del Risco', 'https://turismolanzarote.com/en/teguise-history-in-the-shadow-of-the-risco/']],
      fuentes: [
        ['Turismo Lanzarote: Teguise', 'https://turismolanzarote.com/en/teguise/'],
        ['Ayuntamiento de Teguise: el Conjunto Histórico', 'https://teguise.es/wp-content/uploads/2015/09/teguise-conjunto-historico-artistico.pdf'],
        ['ULPGC: el municipio de Teguise', 'https://www.dis.ulpgc.es/canarias/lanzarote/teguise.html']
      ]
    },
    {
      lugar: 'El Golfo', titulo: 'La laguna verde', img: 'paisaje-golfo.jpg', pos: '35% 60%',
      texto: [
        'Junto al pueblo pesquero de El Golfo, en la costa oeste de Yaiza, el mar se ha comido la mitad de un antiguo cono volcánico. En la mitad que queda se ve, como en un corte, cómo se apilaron las capas de ceniza y roca: rojas, ocres y negras.',
        'Dentro del cráter hay una laguna de agua de mar, el Charco de los Clicos o Charco Verde. Una franja de arena negra la separa del océano. Su color verde viene de algas microscópicas y cambia de tono según la luz.',
        'Forma parte del Parque Natural de Los Volcanes y es reserva natural: está prohibido bañarse en la laguna.'
      ],
      dato: 'Se llama «de los Clicos» por un marisco, el clico, que antes abundaba allí y hoy ha desaparecido.',
      extra: ['El Charco de los Clicos ha salido como decorado en más de una decena de películas.', ['Lanzarote Film Commission (Turismo Lanzarote): ruta de Timanfaya', 'https://film.turismolanzarote.com/en/film-destination/cinema-routes/timanfaya-a-volcano-of-film/']],
      fuentes: [
        ['Ayuntamiento de Yaiza: el Charco de los Clicos', 'https://yaiza.es/lugares-de-interes/'],
        ['Gobierno de Canarias: El Golfo', 'https://www3.gobiernodecanarias.org/medusa/wiki/index.php?title=El_Golfo'],
        ['Hola Islas Canarias: Mirador de El Golfo', 'https://www.hellocanaryislands.com/viewpoints/lanzarote/el-golfo-viewpoint/']
      ]
    },
    {
      lugar: 'Salinas de Janubio', titulo: 'El jardín de sal', img: 'paisaje-janubio.jpg', pos: '45% 70%',
      texto: [
        'En la costa de Yaiza, junto a la playa de Janubio, están las salinas más grandes de Canarias: cuadrículas blancas sobre tierra volcánica. Se empezaron a construir en 1895 y hoy las sigue trabajando la misma familia.',
        'El agua de mar llega desde la laguna de Janubio, que nació cuando las lavas de 1730-1736 cerraron una antigua bahía. Antes la subían cinco molinos de viento. El sol y el viento la evaporan poco a poco hasta que solo queda la sal.',
        'Durante siglos, la sal fue uno de los productos más importantes de Lanzarote: servía para conservar el pescado que traían los barcos de la isla.'
      ],
      dato: 'Algunos estanques se vuelven rosados o rojizos por un pequeño crustáceo, la artemia, y por un alga, Dunaliella salina. Las salinas también son refugio de muchas aves.',
      extra: ['En Lanzarote se han visto más de 190 especies de aves migratorias, y las salinas de Janubio son uno de los mejores sitios de Canarias para observar aves de orilla.', ['Ayuntamiento de Yaiza: datos generales', 'https://yaiza.es/datos-generales/']],
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
        'Es una de las zonas más antiguas de la isla, muy anterior a los volcanes de Timanfaya. Su punto más alto, las Peñas del Chache, con unos 671 metros, es también el techo de Lanzarote.',
        'A sus pies se extiende la playa de Famara, de casi 6 km, junto al pueblo de Caleta de Famara. El viento constante la hace famosa entre los surfistas.'
      ],
      dato: 'La arena viaja con el viento hacia el interior y forma El Jable, un gran arenal entre el Risco de Famara y el centro de la isla.',
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
        'Haría es un pueblo de casas blancas en un valle del norte de Lanzarote. Lo llaman «el valle de las mil palmeras» por su gran palmeral de palmeras canarias, entre huertas, tuneras y otros cactus.',
        'Desde el Mirador de Malpaso se contempla el palmeral desde lo alto. Con las hojas de palma, los cesteros del pueblo tejían cestas y esteras.',
        'César Manrique pasó en Haría sus últimos años, hasta 1992. Su casa, en medio del palmeral, es casa-museo desde 2013.'
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
        'El edificio está casi escondido: lo cubre una piel de piedra volcánica para que se confunda con el risco. Por dentro, grandes ventanales miran al estrecho de El Río, el brazo de mar que separa Lanzarote de La Graciosa.',
        'Desde allí se ven La Graciosa y los islotes del Archipiélago Chinijo, que con el risco forman un parque natural, y abajo, al pie del risco, las Salinas del Río.'
      ],
      dato: 'Manrique aprovechó una antigua batería de artillería de costa: por eso el lugar se llama la Batería del Río. Hoy el mirador es Bien de Interés Cultural.',
      extra: ['En la entrada, Manrique puso una escultura de hierro con un pez y un pájaro: el agua y el aire que rodean el mirador.', ['CACT Lanzarote (Cabildo): Mirador del Río', 'https://www.cactlanzarote.com/en/cact/mirador-del-rio/']],
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
        'La Cueva de los Verdes está en el norte de Lanzarote, en el municipio de Haría, bajo el Malpaís de La Corona.',
        'Se formó cuando el volcán de La Corona entró en erupción: la lava corrió hacia el mar, se enfrió por fuera y siguió fluyendo por dentro. Al vaciarse, dejó un tubo hueco de más de siete kilómetros.',
        'En los siglos XVI y XVII la gente de la isla se escondía en sus galerías para huir de los piratas. Se cree que su nombre viene de una familia apellidada Verdes que guardaba su ganado cerca.'
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
        'La Graciosa está al norte de Lanzarote, al otro lado de El Río, un brazo de mar de apenas un kilómetro. Mide unos 27 km² y pertenece al municipio de Teguise.',
        'Es uno de los pocos lugares habitados de Europa sin carreteras asfaltadas: sus calles son de arena y se puede andar descalzo.',
        'Hasta 2018 se la consideraba un islote. Ese año se reconoció como la octava isla habitada de Canarias.'
      ],
      dato: 'Solo se puede llegar en barco, desde el puerto de Órzola, en el norte de Lanzarote.',
      extra: ['Su punto más alto, Agujas Grandes, mide 266 metros. Casi toda la isla, menos Caleta de Sebo y Pedro Barba, es Patrimonio Nacional.', ['Gobierno de Canarias: La Graciosa, la octava isla', 'https://www3.gobiernodecanarias.org/medusa/ecoescuela/recursosdigitales/files/formidable/6/cd-03-0000026-infografia-simple-doble-formato-islas-_la-graciosa.pdf']],
      fuentes: [
        ['Gobierno de Canarias: La Graciosa', 'https://www3.gobiernodecanarias.org/medusa/ecoescuela/recursosdigitales/2023/06/02/la-graciosa/'],
        ['Gobierno de Canarias: Isla de La Graciosa', 'https://www3.gobiernodecanarias.org/medusa/wiki/index.php?title=Isla_de_La_Graciosa'],
        ['Turismo Lanzarote: folleto del Archipiélago Chinijo', 'https://turismolanzarote.com/wp-content/uploads/2017/01/Folleto-La-Graciosa-Archipi%C3%A9lago-Chinijo-Teguise.pdf']
      ]
    }
  ];
})();
