export interface PointData {
    id: string;
    timestamp: number;
    points: number[];
  }

  let index = 0;
  
  export class DataGenerator {
    constructor(private pointCount: number) {}
  
    generate(): PointData {
        index++;
      return {
        id: index+'',
        timestamp: Date.now(),
        points: Array.from({ length: this.pointCount }, () => 
          parseFloat((Math.random() * 100).toFixed(2))
        )
      };
    }
  }