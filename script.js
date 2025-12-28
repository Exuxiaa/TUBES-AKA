let barChart, lineChart;
let armstrongIndex = 0;
let iterHistory = [];
let recHistory = [];
let digitChart;

const armstrongByDigit = {
  3: 153,
  4: 9474,
  5: 54748,
  6: 92727,
  7: 93084,
  8: 548834,
  9: 1741725,
  10: 4210818
};



/* ITERATIF */
function powerIterative(b, e) {
  let r = 1;
  for (let i = 0; i < e; i++) r *= b;
  return r;
}

function armstrongIterative(n) {
  const d = n.toString().length;
  let sum = 0, t = n;
  while (t > 0) {
    const digit = t % 10;
    sum += powerIterative(digit, d);
    t = Math.floor(t / 10);
  }
  return sum === n;
}

/* REKURSIF */
function powerRecursive(b, e) {
  if (e === 0) return 1;
  return b * powerRecursive(b, e - 1);
}

function armstrongRecursive(n, d, sum = 0) {
  if (n === 0) return sum;
  const digit = n % 10;
  return armstrongRecursive(
    Math.floor(n / 10),
    d,
    sum + powerRecursive(digit, d)
  );
}

/* MEASURE */
function measure(fn, repeat) {
  let total = 0;

  for (let i = 0; i < repeat; i++) {
    const start = performance.now();
    fn();
    const end = performance.now();
    total += (end - start);
  }

  return total / repeat; // 🔥 RATA-RATA
}


/* MAIN */
function runAnalysis() {
  const num = Number(numberInput.value);
  const repeat = Number(repeatInput.value);

  if (!num || !repeat) {
    alert("Input tidak valid!");
    return;
  }

  const digits = num.toString().length;

  const iterTime = measure(() => armstrongIterative(num), repeat);
  const recTime = measure(
    () => armstrongRecursive(num, digits) === num,
    repeat
  );

  const status = armstrongIterative(num)
    ? "Bilangan Armstrong ✔"
    : "Bukan Bilangan Armstrong ✖";

  statusBox.innerHTML = `
    <span style="color:${armstrongIterative(num) ? '#22c55e' : '#f87171'}">
      ${status}
    </span>
  `;

  // Grafik 1 & 2
  updateBar(iterTime, recTime);
  updateLine(iterTime, recTime);
  updateTable(num, digits, iterTime, recTime, repeat);


  // 🔥 GRAFIK 3 — Analisis Pangkat Digit
  analyzeByDigit(repeat);
}


/* GRAPH 1 */
function updateBar(iterAvg, recAvg) {
  if (barChart) barChart.destroy();

  const ctx = document.getElementById("barChart").getContext("2d");

  barChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: [
        "Iteratif (Rata-rata)",
        "Rekursif (Rata-rata)"
      ],
      datasets: [{
        label: "Mean Execution Time",
        data: [
          iterAvg.toFixed(4),
          recAvg.toFixed(4)
        ],
        backgroundColor: ["#38bdf8", "#f472b6"],
        borderRadius: 12, // 🔥 biar kelihatan premium
        barThickness: 70
      }]
    },
    options: {
      responsive: true,
      animation: {
        duration: 1500,
        easing: "easeOutQuart"
      },
      plugins: {
        title: {
          display: true,
          text: "Perbandingan Rata-rata Waktu Eksekusi Algoritma Armstrong",
          font: { size: 18, weight: "bold" }
        },
        tooltip: {
          callbacks: {
            label: ctx =>
              `${ctx.raw} ms (rata-rata dari beberapa eksekusi)`
          }
        },
        legend: { display: false }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: "Jenis Algoritma"
          }
        },
        y: {
          title: {
            display: true,
            text: "Rata-rata Waktu Eksekusi (ms)"
          },
          beginAtZero: true
        }
      }
    }
  });
}


/* GRAPH 2 */
function updateLine(iter, rec) {
  armstrongIndex++;
  iterHistory.push(iter);
  recHistory.push(rec);

  if (lineChart) lineChart.destroy();
  lineChart = new Chart(document.getElementById("lineChart"), {
    type: "line",
    data: {
      labels: Array.from({ length: armstrongIndex }, (_, i) => i + 1),
      datasets: [
        {
          label: "Iteratif",
          data: iterHistory,
          borderColor: "#38bdf8",
          tension: 0.4
        },
        {
          label: "Rekursif",
          data: recHistory,
          borderColor: "#f472b6",
          tension: 0.4
        }
      ]
    },
    options: {
      scales: {
        x: { title: { display: true, text: "Urutan Pengujian" } },
        y: { title: { display: true, text: "Waktu Eksekusi (ms)" } }
      }
    }
  });
}

/* TABLE */
function updateTable(num, d, iterAvg, recAvg, repeat) {
  const isIterFaster = iterAvg < recAvg;
  const winner = isIterFaster ? "Iteratif" : "Rekursif";
  const color = isIterFaster ? "#38bdf8" : "#f472b6";

  resultTable.querySelector("tbody").innerHTML += `
    <tr>
      <td>${num}</td>
      <td>${d}</td>
      <td>${iterAvg.toFixed(4)} ms</td>
      <td>${recAvg.toFixed(4)} ms</td>
      <td>${repeat}x</td>
      <td style="color:${color}; font-weight:700">
        ${winner}
      </td>
    </tr>
  `;
}


function analyzeByDigit(repeat) {
  const labels = [];
  const iterData = [];
  const recData = [];

  for (const digit in armstrongByDigit) {
    const num = armstrongByDigit[digit];

    const iterAvg = measure(() => armstrongIterative(num), repeat);
    const recAvg = measure(
      () => armstrongRecursive(num, Number(digit)) === num,
      repeat
    );

    labels.push(num.toString()); // 🔥 X = NILAI EXACT
    iterData.push(iterAvg.toFixed(4));
    recData.push(recAvg.toFixed(4));
  }

  if (digitChart) digitChart.destroy();

  digitChart = new Chart(
    document.getElementById("digitChart").getContext("2d"),
    {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Iteratif (Rata-rata)",
            data: iterData,
            borderColor: "#38bdf8",
            tension: 0.4,
            pointRadius: 6
          },
          {
            label: "Rekursif (Rata-rata)",
            data: recData,
            borderColor: "#f472b6",
            tension: 0.4,
            pointRadius: 6
          }
        ]
      },
      options: {
        plugins: {
          title: {
            display: true,
            text: "Grafik 3 — Runtime Berdasarkan Bilangan Armstrong Nyata"
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: "Bilangan Armstrong Representatif (Digit 3–10)"
            }
          },
          y: {
            title: {
              display: true,
              text: "Rata-rata Waktu Eksekusi (ms)"
            },
            beginAtZero: true
          }
        }
      }
    }
  );
}


function updateDigitChart(labels, iterData, recData) {
  if (digitChart) digitChart.destroy();

  digitChart = new Chart(document.getElementById("digitChart"), {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Iteratif",
          data: iterData,
          borderColor: "#38bdf8",
          tension: 0.4
        },
        {
          label: "Rekursif",
          data: recData,
          borderColor: "#f472b6",
          tension: 0.4
        }
      ]
    },
    options: {
      animation: { duration: 1600 },
      plugins: {
        legend: { position: "top" }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: "Jumlah Digit / Pangkat"
          }
        },
        y: {
          title: {
            display: true,
            text: "Waktu Eksekusi (ms)"
          }
        }
      }
    }
  });
}

