type ApiRouteT =
  | {
      route: "clusters";
      searchParams?: {
        hasMapItem?: boolean
      }
    }
  | {
      route: "companies";
      searchParams?: {
        hasMapItem?: boolean
      }
    };

export function getApiRoute({
  route,
  searchParams
}: ApiRouteT) {

  switch (route) {
    case "clusters":
      const mapItemParamClusters = searchParams?.hasMapItem !== undefined 
        ? `hasMapItem=${searchParams.hasMapItem}`
        : ''

      return `/api/clusters?${mapItemParamClusters}`
    
    case "companies":
      const mapItemParamCompanies = searchParams?.hasMapItem !== undefined 
        ? `hasMapItem=${searchParams.hasMapItem}`
        : ''

      return `/api/companies?${mapItemParamCompanies}`
  
    default:
      return ""
  }
}