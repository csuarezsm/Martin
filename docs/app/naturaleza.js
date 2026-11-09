/* Martín: Los Caminos del Volcán — Guía de la naturaleza
   Las plantas y animales que salen en el juego. Cada especie se descubre al terminar el nivel del lugar donde vive (descubre: level_id) y sale dibujada en él.
   Datos de fuentes oficiales (Banco de Datos de Biodiversidad del Gobierno de Canarias, MITECO, Cabildo de Lanzarote, BOC).
   origen: 'endemica-lz' (solo en Lanzarote), 'endemica' (solo en Canarias), 'nativa', 'introducida', 'invasora', 'cultivo', 'salinas'.
   © 2026 IT Canarias. Todos los derechos reservados. */
(function () {
  window.NATURALEZA = [
    {
      id: 'bejeque', descubre: 'norte_l09_famara', nombre: 'Bejeque del malpaís', cientifico: 'Aeonium lancerottense', origen: 'endemica-lz',
      texto: [
        'Solo existe en Lanzarote. Crece en el risco de Famara, en el valle de Haría y en las lavas de Timanfaya.',
        'Sus rosetas de hojas carnosas guardan el agua, y en junio y julio se llena de flores rosadas.'
      ],
      fuente: ['Gobierno de Canarias: bejeque del malpaís', 'https://www3.gobiernodecanarias.org/medusa/wiki/index.php?title=Bejeque_del_malpa%C3%ADs']
    },
    {
      id: 'palmera', descubre: 'norte_l10_haria', nombre: 'Palmera canaria', cientifico: 'Phoenix canariensis', origen: 'endemica',
      texto: [
        'Solo crece de forma natural en las islas Canarias. Puede superar los 20 metros de altura y vivir dos o tres siglos.',
        'Las palmeras hembra dan dátiles; las macho, no. En Lanzarote, el gran palmeral está en el valle de Haría.'
      ],
      fuente: ['Gobierno de Canarias: palmera canaria', 'https://www3.gobiernodecanarias.org/medusa/wiki/index.php?title=Palmera_canaria_%28Phoenix_canariensis%29']
    },
    {
      id: 'lagarto', descubre: 'uga_l03_dry_ravine', nombre: 'Lagarto atlántico', cientifico: 'Gallotia atlantica', origen: 'endemica',
      texto: [
        'Solo vive de forma natural en las islas orientales de Canarias: Lanzarote, Fuerteventura y sus islotes.',
        'Es el vertebrado más abundante de Timanfaya. Tiene manchas de colores a los lados del cuerpo y está protegido.'
      ],
      fuente: ['MITECO: el lagarto de Timanfaya', 'https://www.miteco.gob.es/en/parques-nacionales-oapn/red-parques-nacionales/parques-nacionales/timanfaya/visita-virtual.html']
    },
    {
      id: 'tabaiba', descubre: 'uga_l02_after_the_storm', nombre: 'Tabaiba dulce', cientifico: 'Euphorbia balsamifera', origen: 'nativa',
      texto: [
        'Un arbusto de ramas gruesas y hojas pequeñas que aguanta muy bien la sequía.',
        'Es el símbolo vegetal de Lanzarote.'
      ],
      fuente: ['Gobierno de Canarias: Malpaís de La Corona', 'https://www3.gobiernodecanarias.org/medusa/wiki/index.php?title=Malpa%C3%ADs_de_La_Corona']
    },
    {
      id: 'aulaga', descubre: 'uga_l02_after_the_storm', nombre: 'Aulaga', cientifico: 'Launaea arborescens', origen: 'nativa',
      texto: [
        'Un arbusto espinoso de tallos en zigzag, casi sin hojas, con flores amarillas.',
        'Vive en los sitios más secos y soleados. Además de en Canarias, crece en el norte de África y el sudeste de España.'
      ],
      fuente: ['Gobierno de Canarias: ahulaga', 'https://www3.gobiernodecanarias.org/medusa/wiki/index.php?title=Ahulaga']
    },
    {
      id: 'vid', descubre: 'uga_l04_basin_descent', nombre: 'Viña de malvasía', cientifico: 'Vitis vinifera', origen: 'cultivo',
      texto: [
        'En La Geria, cada viña se planta en un hoyo excavado en el picón y se protege del viento con un pequeño muro de piedra, el zoco.',
        'De todas las uvas de la isla, la malvasía es la que más destaca por la calidad de su vino.'
      ],
      fuente: ['Cabildo de Lanzarote: ficha técnica del cultivo de la vid', 'https://www.cabildodelanzarote.com/documents/35307/78425/ficha_tecnica_del_cultivo_de_la_vid.pdf/3928871f-28d8-f2f2-d7a5-c9505b2afa16?t=1620735957625']
    },
    {
      id: 'tunera', descubre: 'uga_l01_water_delivery', nombre: 'Tunera', cientifico: 'Opuntia', origen: 'introducida',
      texto: [
        'Llegó de América. Se plantó en Lanzarote para criar la cochinilla, un insecto del que se saca un tinte rojo.',
        'Su fruto es el tuno, uno de los frutos que recoge Martín por el camino.'
      ],
      fuente: ['BOC: Jardín de Cactus, Bien de Interés Cultural', 'https://www.gobiernodecanarias.org/boc/2022/094/018.html']
    },
    {
      id: 'pita', descubre: 'uga_l05_two_roads', nombre: 'Pita', cientifico: 'Agave americana', origen: 'invasora',
      texto: [
        'Viene de México y llegó a Canarias en el siglo XVI. Florece una sola vez en su vida, entre los 20 y los 30 años, y después muere.',
        'Hoy es una especie invasora: se extiende sola y quita sitio a las plantas de aquí.'
      ],
      fuente: ['Gobierno de Canarias: pita (especies introducidas)', 'https://www.biodiversidadcanarias.es/exos/especie/F00962']
    },
    {
      id: 'aloe', descubre: 'uga_l06_great_delivery', nombre: 'Aloe vera', cientifico: 'Aloe vera', origen: 'introducida',
      texto: [
        'Viene del norte y del este de África y de Arabia. En Canarias se cultiva sobre todo en Lanzarote, Gran Canaria y Fuerteventura.',
        'De sus hojas se saca un jugo que se usa para cuidar la piel.'
      ],
      fuente: ['Cabildo de Lanzarote: ficha técnica del cultivo del aloe', 'https://www.cabildodelanzarote.com/documents/35307/78325/ficha_tecnica_del_cultivo_de__aloe_vera.pdf/6d484d29-6142-b195-ec78-c48a7d17793d?t=1620721613744']
    },
    {
      id: 'camello', descubre: 'uga_l01_water_delivery', nombre: 'Camello canario', cientifico: 'Camelus dromedarius', origen: 'raza',
      texto: [
        'Tiene una sola joroba, como los dromedarios, pero en Canarias siempre se le ha llamado camello. Y con razón: el camello canario es una raza propia, reconocida en el Catálogo Oficial de Razas de Ganado de España.',
        'Es una raza autóctona en peligro de extinción. Llegó a las islas para el trabajo del campo y hoy, desde Uga, pasea a los visitantes por Timanfaya. Martín es uno de ellos.'
      ],
      fuente: ['Ministerio de Agricultura: raza Camello Canario', 'https://www.mapa.gob.es/en/ganaderia/temas/zootecnia/razas-ganaderas/arca/logotipo-camello-canario']
    },
    {
      id: 'artemia', descubre: 'norte_l08_janubio', nombre: 'Artemia', cientifico: 'Artemia parthenogenetica', origen: 'salinas',
      texto: [
        'Un crustáceo diminuto que vive en el agua muy salada de las salinas.',
        'Junto con un alga, Dunaliella salina, tiñe de rosa algunos estanques de Janubio.'
      ],
      fuente: ['Gobierno de Canarias: Salinas del Janubio', 'https://www3.gobiernodecanarias.org/medusa/wiki/index.php?title=Salinas_del_Janubio']
    }
  ];
})();
