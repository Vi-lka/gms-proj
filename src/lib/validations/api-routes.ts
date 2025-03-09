import { GetAreasDataSchema } from "./areas-data"
import { searchAreasDataSerialize } from "./search-params"

export type ClustersSearchParamsT = {
  hasMapItem?: boolean
}
export type CompaniesSearchParamsT = {
  hasMapItem?: boolean
}
export type FieldsSearchParamsT = {
  hasMapItem?: boolean;
  hasFieldMap?: boolean;
  mapItemId?: string;
  companyId?: string;
  fieldsIds?: string[];
}
export type LicensedAreasSearchParamsT = {
  fieldId?: string;
}


type ApiRouteT =
  | {
      route: "clusters";
      searchParams?: ClustersSearchParamsT
    }
  | {
      route: "companies";
      searchParams?: CompaniesSearchParamsT
    }
  | {
      route: "fields";
      searchParams?: FieldsSearchParamsT
    }
  | {
      route: "licensed-areas";
      searchParams?: LicensedAreasSearchParamsT
    }
  | {
      route: "areas-data";
      searchParams?: GetAreasDataSchema
    }


export function getApiRoute({
  route,
  searchParams
}: ApiRouteT) {

  switch (route) {
    case "clusters":
      const hasMapItemParamClusters = searchParams?.hasMapItem !== undefined 
        ? `hasMapItem=${searchParams.hasMapItem}`
        : ''

      return `/api/clusters?${hasMapItemParamClusters}`
    
    case "companies":
      const hasMapItemParamCompanies = searchParams?.hasMapItem !== undefined 
        ? `hasMapItem=${searchParams.hasMapItem}`
        : ''

      return `/api/companies?${hasMapItemParamCompanies}`

    case "fields":
      const hasMapItemParamFields = searchParams?.hasMapItem !== undefined 
        ? `hasMapItem=${searchParams.hasMapItem}`
        : ''
      const mapItemIdParamFields = searchParams?.mapItemId !== undefined 
        ? `mapItemId=${searchParams.mapItemId}`
        : ''
      const companyIdParamFields = searchParams?.companyId !== undefined
        ? `companyId=${searchParams.companyId}`
        : ''
      const hasFieldMapParamFields = searchParams?.hasFieldMap !== undefined
        ? `hasFieldMap=${searchParams.hasFieldMap}`
        : ''
      const fieldIdsParamFields = searchParams?.fieldsIds !== undefined
        ? `fieldsIds=${searchParams.fieldsIds.toString()}`
        : ''

      const fieldsParams = [
        hasMapItemParamFields, 
        mapItemIdParamFields, 
        companyIdParamFields, 
        hasFieldMapParamFields,
        fieldIdsParamFields
      ]

      return `/api/fields?${fieldsParams.join('&')}`

    case "licensed-areas":
      const fieldIdParamAreas = searchParams?.fieldId !== undefined
        ? `fieldId=${searchParams.fieldId}`
        : ''

      const areasParams = [fieldIdParamAreas]

      return `/api/licensed-areas?${areasParams.join('&')}`

    case "areas-data":
      if (searchParams) return searchAreasDataSerialize('/api/areas-data', searchParams)
      return '/api/areas-data'
  
    default:
      return ''
  }
}