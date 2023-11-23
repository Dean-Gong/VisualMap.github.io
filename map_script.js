// 实验一
// 初始化Leaflet地图到指定的div元素中
let map = L.map('map-container', {
    center: [14, 111],
    zoom: 5,
    minZoom: 4,
    maxZoom: 6,
});
L.tileLayer('实验一/map/{z}/{x}/{y}.png').addTo(map);

L.backgroundColor
const basemaps = {
    StreetView: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'),
    Topography: L.tileLayer.wms('http://ows.mundialis.de/services/service?', {layers: 'TOPO-WMS'}),
    Topography2: L.tileLayer.wms('实验一/mapLabel/{z}/{x}/{y}.png', {layers: 'TOPO-WMS'}),//标注图层
};
L.control.layers(basemaps).addTo(map);

// basemaps.Topography2.addTo(map);
// basemaps.Topography.addTo(map);

basemaps.Topography2.addTo(map);


function fillDateSelector(year, month) {
    var selector = document.getElementById('date-selector');
    var daysInMonth = new Date(year, month, 0).getDate();

    for (var day = 1; day <= daysInMonth; day++) {
        var dayStr = `${year}${month.toString().padStart(2, '0')}${day.toString().padStart(2, '0')}`;
        var option = new Option(`2021年${month}月${day}日`, dayStr);
        selector.add(option);
    }
}

// 假设是2021年1月
fillDateSelector(2021, 1);


document.getElementById('date-selector').addEventListener('change', function () {
    var selectedDate = this.value;
    loadAndDisplayData(selectedDate);
});

function loadAndDisplayData(date) {
    // 根据选择的日期构建文件路径
    var uFilePath = 'asc/' + date + '/ERA5U/00.asc';
    var vFilePath = 'asc/' + date + '/ERA5V/00.asc';

    d3.text(uFilePath, function (u) {
        d3.text(vFilePath, function (v) {
            displayVectorField(u, v);
        });
    });
}

function displayVectorField(u, v) {
    let scaleFactor = 0.2; // to m/s
    let vf = L.VectorField.fromASCIIGrids(u, v, scaleFactor);
    var range = vf.range;
    var vectorScale = chroma.scale(['#f0f5e5']).domain(range);


    // 删除旧的图层（如果存在）
    if (window.currentLayer) {
        if (window.currentLayer.vector) {
            map.removeLayer(window.currentLayer.vector);
        }
        if (window.currentLayer.heatmap) {
            map.removeLayer(window.currentLayer.heatmap);
        }
        if (magnitude) {
            map.removeControl(magnitude);
        }
    } else {
        window.currentLayer = {};
    }

    // 创建新的图层
    var vectorLayer = L.canvasLayer.vectorFieldAnim(vf, {
        paths: 600,
        color: vectorScale,
        velocityScale: 1 / 50,
        frameRate: 120,
    });

    const s = vf.getScalarField('magnitude');
    var magnitude = L.canvasLayer.scalarField(s, {
        color: chroma.scale(['yellow', 'lightgreen', '008ae5'])
            .domain([0, 0.25, 1]).correctLightness(),
        opacity: 0.6
    }).addTo(map);

    vectorLayer.addTo(map);
    window.currentLayer = {vector: vectorLayer, heatmap: magnitude};
}

// 初始加载（可选）
loadAndDisplayData('20210101');


