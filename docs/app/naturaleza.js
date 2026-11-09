/* Martín: Los Caminos del Volcán — Guía de la naturaleza
   Las plantas y animales que salen en el juego. Cada especie se descubre al terminar un nivel donde sale (descubre: level_id).
   Cada frase está sacada de sus fuentes oficiales (Gobierno de Canarias, Banco de Datos de Biodiversidad de Canarias, MITECO, Ministerio de Agricultura, BOC, Turismo de Islas Canarias); no se añade nada que no digan.
   origen: 'endemica-lz' (solo en Lanzarote), 'endemica' (endemismo canario), 'nativa', 'introducida', 'invasora', 'cultivo', 'salinas', 'raza', 'simbolo'.
   © 2026 IT Canarias. Todos los derechos reservados. */
(function () {
  const GC = t => 'https://www3.gobiernodecanarias.org/medusa/wiki/index.php?title=' + t;
  window.NATURALEZA = [
    {
      id: 'bejeque', descubre: 'norte_l09_famara', nombre: 'Bejeque del malpaís', cientifico: 'Aeonium lancerottense', origen: 'endemica-lz',
      texto: [
        'Solo existe en Lanzarote. Abunda en el macizo de Famara, entre los 200 y los 500 metros de altitud, y también crece en el valle de Malpaso-Haría y en el Parque Nacional de Timanfaya.',
        'Sus hojas carnosas forman rosetas de hasta 18 centímetros. Florece en junio y julio, con flores de color blanco rosado.'
      ],
      fuentes: [['Gobierno de Canarias: bejeque del malpaís', GC('Bejeque_del_malpa%C3%ADs')]]
    },
    {
      id: 'palmera', descubre: 'norte_l10_haria', nombre: 'Palmera canaria', cientifico: 'Phoenix canariensis', origen: 'endemica',
      texto: [
        'Es un endemismo canario: de forma natural solo crecía en las islas Canarias. Hoy se planta como adorno en muchos lugares y crece asilvestrada en otros países.',
        'Tiene un solo tronco, que no se ramifica. En los palmerales silvestres crece más o menos un metro cada siete años y medio.'
      ],
      fuentes: [['MITECO: Atlas y Libro Rojo de la Flora Vascular Amenazada (palmera canaria)', 'https://www.miteco.gob.es/es/biodiversidad/temas/inventarios-nacionales/09047122801a3450_tcm30-99687.pdf'],
        ['MITECO: palmerales de Phoenix canariensis', 'https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/temas/espacios-protegidos/9370_tcm30-196903.pdf']]
    },
    {
      id: 'lagarto', descubre: 'uga_l03_dry_ravine', nombre: 'Lagarto atlántico', cientifico: 'Gallotia atlantica', origen: 'endemica',
      texto: [
        'Es un endemismo canario. Vive en las islas e islotes orientales del archipiélago, sobre todo en Lanzarote y Fuerteventura.',
        'Es el vertebrado más abundante en Timanfaya. En Lanzarote está catalogado como especie de protección especial.'
      ],
      fuentes: [['MITECO: Parque Nacional de Timanfaya', 'https://www.miteco.gob.es/en/parques-nacionales-oapn/red-parques-nacionales/parques-nacionales/timanfaya/visita-virtual.html'],
        ['Banco de Datos de Biodiversidad de Canarias: lagarto atlántico', 'https://www.biodiversidadcanarias.es/centinela/especie/V00169']]
    },
    {
      id: 'tabaiba', descubre: 'uga_l02_after_the_storm', nombre: 'Tabaiba dulce', cientifico: 'Euphorbia balsamifera', origen: 'simbolo',
      texto: [
        'La tabaiba dulce es el símbolo vegetal de Lanzarote.',
        'En el malpaís de La Corona crece un extenso tabaibal, uno de los más ricos de Canarias.'
      ],
      fuentes: [['Gobierno de Canarias: Malpaís de La Corona', GC('Malpa%C3%ADs_de_La_Corona')]]
    },
    {
      id: 'aulaga', descubre: 'uga_l02_after_the_storm', nombre: 'Aulaga', cientifico: 'Launaea arborescens', origen: 'nativa',
      texto: [
        'Un arbusto espinoso de tallos en zigzag, que normalmente no tiene hojas. Sus flores son amarillas.',
        'Crece en todas las islas, sobre todo en Fuerteventura, en zonas soleadas y calurosas. Fuera de Canarias vive en el norte de África y en la costa del sudeste de España.'
      ],
      fuentes: [['Gobierno de Canarias: ahulaga', GC('Ahulaga')]]
    },
    {
      id: 'vid', descubre: 'uga_l04_basin_descent', nombre: 'Parra (vid)', cientifico: 'Vitis vinifera', origen: 'cultivo',
      texto: [
        'En Lanzarote se cultiva de dos formas tradicionales: en hoyos y en zanjas. Los hoyos se excavan en forma de cono en el picón para que la parra llegue a la tierra de debajo; las zanjas tienen muros que las separan.',
        'Para protegerla del viento se levantan zocos, pequeños muros de piedra en media luna. Sus vinos más destacados son los blancos de malvasía, y la vendimia se hace en julio, antes que en ningún otro lugar de Europa.'
      ],
      fuentes: [['Turespaña: viñedos de La Geria', 'https://www.spain.info/es/descubrir-espana/budouen-kazan-ransarote/'],
        ['FAO: sistemas agrícolas de Lanzarote (Patrimonio Agrícola Mundial)', 'https://sfcs.fao.org/giahs/giahs-around-the-world/agricultural-systems-lanzarote-spain/en'],
        ['Ministerio de Agricultura: los enarenados de Lanzarote', 'https://mapa.gob.es/ministerio/pags/Biblioteca/Revistas/pdf%5FLEAD%2FALE%5F2000%5F10%5F22%5F23%2Epdf'],
        ['Papeles de Geografía (Universidad de Murcia): el viñedo de La Geria', 'https://www.redalyc.org/pdf/407/40743406008.pdf']]
    },
    {
      id: 'tunera', descubre: 'uga_l01_water_delivery', nombre: 'Tunera', cientifico: 'Opuntia ficus-indica', origen: 'cultivo',
      texto: [
        'En Guatiza y Mala hay grandes extensiones de cultivo de tunera. Sobre sus pencas se cría la cochinilla, un cultivo que llegó a Canarias desde México en el primer cuarto del siglo XIX.',
        'Su fruto es el tuno, uno de los frutos que recoge Martín por el camino.'
      ],
      fuentes: [['BOC: Jardín de Cactus, Bien de Interés Cultural', 'https://www.gobiernodecanarias.org/boc/2022/094/018.html']]
    },
    {
      id: 'pita', descubre: 'uga_l05_two_roads', nombre: 'Pita', cientifico: 'Agave americana', origen: 'invasora',
      texto: [
        'Viene del este de México y Centroamérica, y llegó a Canarias en el siglo XVI. Florece una sola vez en su vida, entre los 20 y los 30 años, y después muere.',
        'Está catalogada como especie invasora en todas las islas, también en Lanzarote.'
      ],
      fuentes: [['Banco de Datos de Biodiversidad de Canarias: pita', 'https://www.biodiversidadcanarias.es/exos/especie/F00962']]
    },
    {
      id: 'aloe', descubre: 'uga_l06_great_delivery', nombre: 'Aloe vera', cientifico: 'Aloe vera', origen: 'introducida',
      texto: [
        'Viene del norte y del este de África y de Arabia. En Canarias se cultiva sobre todo en Lanzarote, Gran Canaria y Fuerteventura.',
        'Tiene hojas grandes y carnosas, y Canarias es la primera región de Europa en producción de aloe.'
      ],
      fuentes: [['Gobierno de Canarias: aloe', GC('Aloe')]]
    },
    {
      id: 'camello', descubre: 'uga_l01_water_delivery', nombre: 'Camello canario', cientifico: 'Camelus dromedarius', origen: 'raza',
      texto: [
        'En Canarias siempre se le ha llamado camello, aunque tiene una sola joroba, como los dromedarios. El camello canario es una raza propia: el Catálogo Oficial de Razas de Ganado de España la clasifica como raza autóctona en peligro de extinción.',
        'Fue una herramienta básica para trabajar los campos y para llevar personas y mercancías. Hoy vive casi solo en las islas orientales y se usa sobre todo para pasear a los visitantes. A la cría, desde que nace hasta que deja de mamar, en Canarias se le llama guelfo.'
      ],
      fuentes: [['Ministerio de Agricultura: raza Camello Canario', 'https://www.mapa.gob.es/en/ganaderia/temas/zootecnia/razas-ganaderas/arca/logotipo-camello-canario'],
        ['Ministerio de Agricultura: libro genealógico de la raza Camello Canario', 'https://servicio.mapama.gob.es/es/ganaderia/temas/zootecnia/ordende2deoctubrede2015porlaqueseapruebalareglamentaciondellgrazacamellocanario_tcm30-117770.pdf'],
        ['RAE, Diccionario histórico del español de Canarias: guelfo', 'https://www.rae.es/tdhle/guelfo']]
    },
    {
      id: 'artemia', descubre: 'norte_l08_janubio', nombre: 'Artemia', cientifico: 'Artemia parthenogenetica', origen: 'salinas',
      texto: [
        'Un pequeño crustáceo de color rojo que vive en las salinas.',
        'Junto con un alga, Dunaliella salina, da a las salinas de Janubio su color rojizo.'
      ],
      fuentes: [['Gobierno de Canarias: Salinas del Janubio', GC('Salinas_del_Janubio')]]
    }
  ];
})();
