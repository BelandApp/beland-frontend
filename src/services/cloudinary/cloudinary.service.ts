import { notify } from "src/hooks/notification/notify.external";
import { CoreApiService } from "../core";
import { getBackendErrorMessage } from "../helpers";

class CloudinaryServiceClass extends CoreApiService {
  private readonly ENDPOINTS = { UPLOAD: "cloudinary/upload-image" } as const;
  async uploadImage(formData: FormData) {
    try {
      return await this.postFormData(this.ENDPOINTS.UPLOAD, formData);
    } catch (error) {
      const res = getBackendErrorMessage(error);
      notify.error({ message: res });
    }
  }
}

export const CloudinaryService = new CloudinaryServiceClass();
