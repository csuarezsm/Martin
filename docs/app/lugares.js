/* Martín: Los Caminos del Volcán — Cuaderno de viaje
   Una ficha divulgativa por nivel. Los datos están contrastados en las fuentes que se citan en cada ficha.
   © 2026 IT Canarias. Todos los derechos reservados. */
(function () {
  window.LUGARES = [
    {
      lugar: 'Uga', titulo: 'El pueblo de los camellos', img: 'paisaje-uga.jpg', pos: '60% 40%',
      texto: [
        'Uga es un pequeño pueblo de casas blancas del municipio de Yaiza, en el sur de Lanzarote, a las puertas del Parque Nacional de Timanfaya.',
        'Durante la gran erupción de 1730 la lava llegó a pocos cientos de metros: el 16 de diciembre de ese año sepultó la vega de Uga, según el diario del cura de Yaiza, Andrés Lorenzo Curbelo. El pueblo se salvó, aunque quedó cubierto de ceniza.',
        'Hoy Uga cría la mayor parte de los dromedarios de la isla, unos 400. Cada día suben por el Camino de los Camellos hasta el Echadero de Timanfaya, donde llevan a los visitantes, como hacían ya en los años cincuenta.'
      ],
      dato: 'Los paseos en camello por Timanfaya están reconocidos como Patrimonio de Interés Social y Cultural, y de ellos viven decenas de familias de Uga.',
      fuentes: [
        ['Uga (enciclopedia, con referencias de MITECO)', 'https://es.hispanopedia.com/wiki/Uga'],
        ['Lanzarote3: qué ver en Uga', 'https://lanzarote3.com/en/what-to-see-in-Uga/'],
        ['La Voz de Lanzarote: los camelleros de Uga', 'https://www.lavozdelanzarote.com/en/news/culture/the-proclamation-of-uga-exalts-the-nobility-of-the-camel-and-the-work-of-its-breeders_218786_102.html']
      ]
    },
    {
      lugar: 'Tiagua y Teguise', titulo: 'Los molinos de gofio', img: 'paisaje.jpg', pos: '85% 30%',
      texto: [
        'Durante siglos, el alimento básico de la gente de Lanzarote fue el gofio: harina de cereales tostados. Los molinos de viento eran la industria que lo hacía posible.',
        'El molino clásico es una torre de planta circular, de dos pisos y techo cónico. El viento mueve las aspas y, mediante engranajes de madera, hace girar dos piedras muy duras que muelen el grano.',
        'Junto a estos molinos de torre se levantaron también las molinas, más ligeras. Aún pueden verse en Teguise, en Tiagua, donde la finca de El Patio conserva su molino, y en San Bartolomé.'
      ],
      dato: 'En la isla, el molino que se ha protegido como Bien de Interés Cultural es el de José María Gil, en San Bartolomé.',
      fuentes: [
        ['Turismo de Teguise: el molino', 'https://turismoteguise.com/es/molino.php?pdf=1'],
        ['Turismo de Teguise: Tiagua', 'https://turismoteguise.com/es/pueblo-tiagua.php?pdf=1'],
        ['Cabrera García, «Revitalización de los molinos de viento» (Univ. de Granada)', 'https://revistaseug.ugr.es/index.php/erph/article/download/6724/5837/16917']
      ]
    },
    {
      lugar: 'Timanfaya', titulo: 'Las Montañas del Fuego', img: 'paisaje-timanfaya.jpg', pos: '30% 40%',
      texto: [
        'La noche del 1 de septiembre de 1730, entre las nueve y las diez, la tierra se abrió cerca de Timanfaya, a casi 10 km de Yaiza. Así empezó la erupción más larga de la historia de Canarias: duró casi seis años, hasta abril de 1736.',
        'Se abrieron unas 300 bocas volcánicas y la lava cubrió cerca de 187 km², una cuarta parte de la isla, sepultando pueblos, cultivos y caminos.',
        'En 1974 el corazón de aquel paisaje se declaró Parque Nacional de Timanfaya, con 5.107 hectáreas. Su símbolo, el «Diablo», lo diseñó César Manrique.'
      ],
      dato: 'Tres siglos después, las coladas de lava siguen enfriándose y «encogen» unos 0,6 cm al año.',
      fuentes: [
        ['RTVC: 292 años desde la erupción de Timanfaya', 'https://rtvc.es/292-anos-desde-la-erupcion-de-timanfaya-en-lanzarote/'],
        ['RTVC: las lavas de Timanfaya siguen enfriando', 'https://rtvc.es/las-lavas-de-timanfaya-encogen-06-cm-al-ano/'],
        ['Ficha del Parque Nacional de Timanfaya', 'https://ksv.neocities.org/img/ficha.pdf']
      ]
    },
    {
      lugar: 'La Geria', titulo: 'Viñas en la ceniza', img: 'paisaje-geria.jpg', pos: '55% 50%',
      texto: [
        'Las erupciones de 1730-1736 enterraron bajo metros de ceniza volcánica, el picón, algunas de las tierras más fértiles de la isla.',
        'Los agricultores excavaron a mano hoyos en el picón hasta llegar a la tierra y plantaron una o pocas cepas en cada uno. Para frenar el viento levantaron pequeños muros semicirculares de piedra, los zocos.',
        'El picón guarda la humedad del rocío en una isla donde casi no llueve. Así nació la malvasía volcánica, la uva blanca más cultivada de la isla. La Geria es Paisaje Protegido desde 1987 y ocupa más de 5.200 hectáreas.'
      ],
      dato: 'Aquí no entran tractores: cada cepa se cuida y se vendimia a mano.',
      fuentes: [
        ['La Geria (enciclopedia, con referencias del Gobierno de Canarias)', 'https://es.hispanopedia.com/wiki/La_Geria'],
        ['Infoagro: conservación de los agrosistemas de La Geria', 'https://www.infoagro.com/noticias/2024/acuerdo_para_la_conservacion_de_los_agrosistemas_del_espacio_vitivinic.asp'],
        ['UPV: La Geria, arquitectura agrícola', 'https://riunet.upv.es/handle/10251/88121?show=full']
      ]
    },
    {
      lugar: 'Los Hervideros', titulo: 'Donde el mar hierve', img: 'paisaje-costa.jpg', pos: '60% 50%',
      texto: [
        'Los Hervideros están en la costa de Yaiza, entre las Salinas de Janubio y El Golfo.',
        'Se formaron cuando la lava de las erupciones de 1730-1736 llegó al Atlántico: al enfriarse de golpe creó acantilados, cuevas y arcos de roca, que el mar sigue esculpiendo.',
        'Con oleaje, las olas entran en las cuevas y salen a presión entre las rocas. El agua parece hervir, y de ahí viene su nombre.'
      ],
      dato: 'Muy cerca está el Charco de los Clicos, en El Golfo, cuyo color verde se debe a un alga, la Ruppia maritima.',
      fuentes: [
        ['Lanzarote.com: Los Hervideros', 'https://www.lanzarote.com/en/?p=2170963'],
        ['Barceló: Los Hervideros de Lanzarote', 'https://www.barcelo.com/guia-turismo/es/espana/lanzarote/que-ver/los-hervideros/'],
        ['Lanzarote3: las erupciones de Timanfaya', 'https://lanzarote3.com/en/timanfaya-eruptions/']
      ]
    },
    {
      lugar: 'Teguise', titulo: 'La antigua capital', img: 'paisaje-ocaso.jpg', pos: '50% 40%',
      texto: [
        'La Villa de Teguise la fundó en el siglo XV Maciot de Béthencourt, sobre la antigua aldea aborigen de Acatife. Según la tradición, su nombre recuerda a la princesa Teguise, hija del rey Guadarfía.',
        'Fue la capital de Lanzarote hasta 1852, cuando la capitalidad pasó a Arrecife. Al estar en el interior, a unos 360 metros de altura, era más fácil vigilar la llegada de piratas, aunque aun así sufrió varios saqueos.',
        'Su casco histórico, de casas blancas y casonas nobles, está declarado conjunto histórico-artístico.'
      ],
      dato: 'Cada domingo, Teguise celebra uno de los mercadillos más grandes de Canarias.',
      fuentes: [
        ['Turismo de Teguise: la Villa', 'https://www.turismoteguise.com/en/pueblos/la-villa-de-teguise'],
        ['ULPGC: la fundación de la Real Villa de Teguise', 'https://mdc.ulpgc.es/files/original/43a9a683b8da379ee222d524f41d12f339789eb4.pdf'],
        ['ULPGC: Teguise, atalaya de la isla', 'https://mdc.ulpgc.es/files/original/423e912c486f9c0fe7f86a2175a18fcf74f767ab.pdf']
      ]
    }
  ];
})();
