declare module 'plotly.js-dist-min' {
  const Plotly: {
    default: {
      newPlot: (element: HTMLDivElement, data: any[], layout?: any) => void;
      purge: (element: HTMLDivElement) => void;
    }
  };
  export default Plotly;
}