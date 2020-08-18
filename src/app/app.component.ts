import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { Decimal } from 'decimal.js'
import { BaseChartDirective, Label, Color } from 'ng2-charts';
import { ChartDataSets, ChartOptions } from 'chart.js';
import { UtilService } from './util.service'

@Component({
  selector: 'app-root',
  template: `
    <div class="row">
      <div class="col-8">
        <div style="display: block;">
        <canvas baseChart [datasets]="lineChartData"
                    [labels]="lineChartLabels"
                    [colors]="lineChartColors"
                    [options]="lineChartOptions"
                    chartType="line"></canvas>
                    </div>

      </div>
      <div class="col-4">
        <div class="form-group">
          <label>Wavelength [nm]: {{wavelength_nm}}</label>
          <input type="range" min=380 max=700 (change)="render()" [(ngModel)]="wavelength_nm" class="input-control">
        </div>

        <div class="form-group">
          <label>Slit Width [nm]: {{slitWidth_nm}}</label>
          <input type="range" min=100000 max=1000000 (change)="render()" [(ngModel)]="slitWidth_nm" class="input-control">
        </div>

        <div class="form-group">
          <label>Wall Distance [m]: {{distance_m}}</label>
          <input type="range" min=1 max=10 (change)="render()" [(ngModel)]="distance_m" class="input-control">
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class AppComponent {
  title = 'interference';
  wavelength_nm = 650;
  slitWidth_nm = 250000;
  distance_m = 4;

  public lineChartData: ChartDataSets[] = [
    { data: [65, 59, 80, 81, 56, 55, 40], label: 'Series A' },
  ];
  public lineChartLabels: Label[] = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];
  public lineChartOptions: (ChartOptions) = {
    responsive: true,
    scales: {
      // We use this empty structure as a placeholder for dynamic theming.
      xAxes: [{
        scaleLabel: {
          display: true,
          labelString: "Interference Pattern [mm]"
        }
      }],
      yAxes: [{
        scaleLabel: {
          display: true,
          labelString: "Intensity"
        }
      }],
    },
    legend: { display: false }
  }
  public lineChartColors: Color[] = [
    {
      backgroundColor: 'rgba(148,159,177,0.2)',
    }
  ]
  @ViewChild(BaseChartDirective, { static: true }) chart?: BaseChartDirective;

  constructor(private utilService: UtilService) {
    this.render()
  }

  render() {
    let data = []
    let labels = []
    for (let h = -25000000; h < 25000000; h += 100000) {
      let offset = this.phaseOffset1(h).sub(this.phaseOffset2(h)).mod(2 * Math.PI)
      let r = (this.l2(h).add(this.l2(h)).div(2)).div(1000000000)

      let intensity = Decimal.cos(offset).pow(2)
      // let intensity = Decimal.sin(offset).div(offset).pow(2)
      data.push(intensity.abs().toNumber())
      labels.push((h / 1000000).toString())
    }
    this.lineChartData[0].data = data
    this.lineChartLabels = labels
    this.lineChartColors[0].backgroundColor = this.utilService.wavelengthToColor(this.wavelength_nm)[0] as string
    this.chart?.update()
  }

  theta(n: number): number {
    return Math.asin(n * this.wavelength_nm / this.distance_m)
  }

  l1(h_nm: number): Decimal {
    let d = new Decimal(this.distance_m).mul(1000000000)
    let h = new Decimal(h_nm - this.slitWidth_nm / 2)
    return Decimal.sqrt(d.pow(2).add(h.pow(2)))
  }

  l2(h_nm: number) {
    let d = new Decimal(this.distance_m).mul(1000000000)
    let h = new Decimal(h_nm + this.slitWidth_nm / 2)
    return Decimal.sqrt(d.pow(2).add(h.pow(2)))
  }

  phaseOffset1(h_nm: number) {
    return this.l1(h_nm).mod(this.wavelength_nm).div(this.wavelength_nm).mul(2 * Math.PI)
  }

  phaseOffset2(h_nm: number) {
    return this.l2(h_nm).mod(this.wavelength_nm).div(this.wavelength_nm).mul(2 * Math.PI)
  }

  //   <table class="table">
  //   <tr>
  //     <th>h [nm]</th>
  //     <th>l1 [nm]</th>
  //     <th>l2 [nm]</th>
  //     <th>phase1</th>
  //     <th>phase2</th>
  //   </tr>

  //   <tr *ngFor="let h_nm of [100000, 200000, 300000, 400000, 500000, 600000, 700000, 800000, 900000]">
  //     <td>{{h_nm}}</td>
  //     <td>{{l1(h_nm)}}</td>
  //     <td>{{l2(h_nm)}}</td>
  //     <td>{{phaseOffset1(h_nm)}}</td>          
  //     <td>{{phaseOffset2(h_nm)}}</td>  
  //   </tr>
  // </table>
}
