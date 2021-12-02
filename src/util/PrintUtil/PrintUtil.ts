import OlMap from 'ol/Map';
import OlLayerGroup from 'ol/layer/Group';
import OlLayerBase from 'ol/layer/Layer';
import OlLayerVector from 'ol/layer/Vector';
import OlSource from 'ol/source/Source';
import OlSourceVector from 'ol/source/Vector';
import OlGeometry from 'ol/geom/Geometry';
import StringUtil from '@terrestris/base-util/dist/StringUtil/StringUtil';
import MapUtil from '@terrestris/ol-util/dist/MapUtil/MapUtil';

/**
 * Helper class for some operations related to print function.
 *
 * @class
 */
export class PrintUtil {

  /**
   * Filter the printable layers from the current maplayers.
   *
   * @return {Array} The printable layers.
   */
  static getPrintableLayers = (map: OlMap, printLayer: OlLayerBase<OlSource>): OlLayerBase<OlSource>[] => {
    const layers = MapUtil.getAllLayers(map);
    return layers.filter((layer: OlLayerBase<OlSource>) => {
      const layerName = layer.get('name');
      return layerName
        && !(layerName.includes('react-geo'))
        && layer.getVisible()
        && !(layer instanceof OlLayerGroup)
        && layer !== printLayer;
    });
  };

  /**
   * Creates an string containing all attributions fo the printable layers.
   *
   * @return {String} The attribution string.
   */
  static getAttributions(map: OlMap, printLayer: OlLayerVector<OlSourceVector<OlGeometry>>): string {
    const layers = PrintUtil.getPrintableLayers(map, printLayer);
    let allAttributions: string[] = [];
    layers
      .filter((layer: OlLayerBase<OlSource>) => layer.getSource && layer.getSource() &&
        layer.getSource().getAttributions && layer.getSource().getAttributions())
      .forEach((layer: OlLayerBase<OlSource>) => {
        const attributions: string[] = layer.getSource().getAttributions().call(this);
        attributions.forEach((attr: string) => {
          const attrString = StringUtil.stripHTMLTags(attr);
          if (!allAttributions.includes(attrString)) {
            allAttributions.push(attrString);
          }
        });
      });
    return allAttributions.join(', ').trim();
  }
}

export default PrintUtil;
