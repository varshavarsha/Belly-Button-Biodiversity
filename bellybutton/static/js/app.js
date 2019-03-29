function buildMetadata(sample) {

  // @TODO: Complete the following function that builds the metadata panel

  // Use `d3.json` to fetch the metadata for a sample
  var metadata_url = `/metadata/${sample}`;
  d3.json(metadata_url).then(metadata_info => {

    // Use d3 to select the panel with id of `#sample-metadata`
    var panel = d3.select("#sample-metadata");

    // Use `.html("") to clear any existing metadata
    panel.html("");

    // Use `Object.entries` to add each key and value pair to the panel
    // Hint: Inside the loop, you will need to use d3 to append new
    // tags for each key-value in the metadata.
    Object.entries(metadata_info).forEach(([key, value]) => {
      console.log(key);
      console.log(value);
      if (key === "sample") { key = "sampleid"; }
      panel
        .append("p")
        .text(`${key.toUpperCase()} : ${value}`);

    })

    // BONUS: Build the Gauge Chart
    var level = metadata_info.WFREQ;

    // Trig to calc meter point
    var degrees = 9 - level,
      radius = .5;
    var radians = degrees * Math.PI / 9;
    var x = radius * Math.cos(radians);
    var y = radius * Math.sin(radians);

    // Path: may have to change to create a better triangle
    var mainPath = 'M -.0 -0.025 L .0 0.025 L ',
      pathX = String(x),
      space = ' ',
      pathY = String(y),
      pathEnd = ' Z';
    var path = mainPath.concat(pathX, space, pathY, pathEnd);

    var data = [{
      type: 'scatter',
      x: [0], y: [0],
      marker: { size: 28, color: '850000' },
      showlegend: false,
      name: 'frequency',
      text: level,
      hoverinfo: 'text+name'
    },
    {
      values: [50 / 9, 50 / 9, 50 / 9, 50 / 9, 50 / 9, 50 / 9, 50 / 9, 50 / 9, 50 / 9, 50],
      rotation: 90,
      text: ['8-9', '7-8', '6-7', '5-6', '4-5', '3-4', '2-3', '1-2', '0-1', ''],
      textinfo: 'text',
      textposition: 'inside',
      marker: {
        colors: ['rgba(53, 99, 33, 0.7)', 'rgba(58, 120, 32, 0.7)', 'rgba(14, 127, 0, .5)', 'rgba(110, 154, 22, .5)',
          'rgba(170, 202, 42, .5)', 'rgba(202, 209, 95, .5)',
          'rgba(210, 206, 145, .5)', 'rgba(232, 226, 202, .5)',
          'rgb(246, 244, 242)', 'rgba(255, 255, 255, 0)']
      },
      labels: ['8-9', '7-8', '6-7', '5-6', '4-5', '3-4', '2-3', '1-2', '0-1', ''],
      hoverinfo: 'label',
      hole: .5,
      type: 'pie',
      showlegend: false
    }];

    var layout = {
      shapes: [{
        type: 'path',
        path: path,
        fillcolor: '850000',
        line: {
          color: '850000'
        }
      }],
      title: '<b>Belly Button Washing Frequency</b> <br> Scrubs per Week',
      height: 500,
      width: 500,
      xaxis: {
        zeroline: false, showticklabels: false,
        showgrid: false, range: [-1, 1]
      },
      yaxis: {
        zeroline: false, showticklabels: false,
        showgrid: false, range: [-1, 1]
      }
    };

    Plotly.newPlot('gauge', data, layout, { showSendToCloud: true });
  });
}

function buildCharts(sample) {

  // @TODO: Use `d3.json` to fetch the sample data for the plots
  var samples_url = `/samples/${sample}`;
  d3.json(samples_url).then(sample_info => {
    // @TODO: Build a Bubble Chart using the sample data
    console.log(sample_info);
    
    var trace1 = {
      x: sample_info.otu_ids,
      y: sample_info.sample_values,
      text: sample_info.otu_labels,
      mode: 'markers',
      marker: {
        color: sample_info.otu_ids,
        size: sample_info.sample_values
      }
    };

    var data = [trace1];

    var layout = {
      title: '<b>OTU_IDS vs. Sample Values</b>',
      showlegend: false,
      height: 600,
      width: 1200,
      xaxis: {
        title: 'OTU_ID'
      },
      yaxis: {
        title: 'Sample Values'
      }
    };

    Plotly.newPlot('bubble', data, layout, { showSendToCloud: true });

    // @TODO: Build a Pie Chart
    // HINT: You will need to use slice() to grab the top 10 sample_values,
    // otu_ids, and labels (10 each).
    var dict = [];

    for (var i = 0; i < sample_info.otu_ids.length; i++) {
      dict.push({ "otu_ids": sample_info.otu_ids[i], "otu_labels": sample_info.otu_labels[i], "sample_values": sample_info.sample_values[i] });
    }

    dict = dict.sort(function (a, b) {
      return b.sample_values - a.sample_values
    }).slice(0, 10);

    console.log(dict);

    var data = [{
      values: dict.map(item => item.sample_values),
      labels: dict.map(item => item.otu_ids),
      hovertext: dict.map(item => item.otu_labels),
      type: 'pie'
    }];

    var layout = {
      title: '<b>Top Ten Samples</b>'
    };

    Plotly.newPlot('pie', data, layout);
  })
}

function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("/names").then((sampleNames) => {
    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    const firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
}

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildCharts(newSample);
  buildMetadata(newSample);
}

// Initialize the dashboard
init();
