
declare module "*.svg" {
  const content: string;
  export default content;
}

declare module "*.html" {
  const content: string;
  export default content;
}

declare module "*.css" {
  const content: any;
  export default content;
}

declare module "*.less" {
  const content: any;
  export default content;
}

declare module "*.ejs" {
  const content: any;
  export default content;
}

declare module "*.png" {
  const content: any;
  export default content;
}

declare module "*.jpg" {
  const content: any;
  export default content;
}

declare module "*.ico" {
  const content: any;
  export default content;
}

type LayerType = {
    Satellite: AMap.TileLayer.Satellite | null,
    Traffic: AMap.TileLayer.Traffic | null,
    RoadNet: AMap.TileLayer.RoadNet | null,
    TileLayer: AMap.TileLayer | null,
}
declare namespace AMap {
  interface Map {
       layers: LayerType;
  }
}