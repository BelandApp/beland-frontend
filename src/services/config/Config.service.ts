import {
  Location,
  RawLocation,
} from "src/screens/DashboardUser/hooks/useConfig";
import { CoreApiService } from "../core";

class ConfigServiceClass extends CoreApiService {
  private readonly ENDPOINTS = {
    LOCATION: "/location",
  };

  /**
   * Get location
   */
  async getLocation(): Promise<any> {
    return this.get(`${this.ENDPOINTS.LOCATION}`);
  }

  async createLocation(data: RawLocation): Promise<any> {
    return this.post(`${this.ENDPOINTS.LOCATION}`, data);
  }

  async updateLocation(id: string, data: Location): Promise<any> {
    return this.put(`${this.ENDPOINTS.LOCATION}/${id}`, data);
  }

  async deleteLocation(id: string): Promise<any> {
    return this.delete(`${this.ENDPOINTS.LOCATION}/${id}`);
  }
}

export const ConfigService = new ConfigServiceClass();
