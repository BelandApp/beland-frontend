import { notify } from "src/hooks/notification/notify.external";
import { CoreApiService } from "../core";
import { getBackendErrorMessage } from "../helpers";

class CloudinaryServiceClass extends CoreApiService {
  private readonly ENDPOINTS = {
    UPLOAD_IMAGE: "cloudinary/upload-image",
    UPLOAD_VIDEO: "cloudinary/upload-video",
  } as const;
  async uploadImage(formData: FormData) {
    try {
      return await this.postFormData(this.ENDPOINTS.UPLOAD_IMAGE, formData);
    } catch (error) {
      const res = getBackendErrorMessage(error);
      notify.error({ message: res });
    }
  }
  async uploadVideo(formData: FormData) {
    try {
      return await this.postFormData(this.ENDPOINTS.UPLOAD_VIDEO, formData);
    } catch (error) {
      const res = getBackendErrorMessage(error);
      notify.error({ message: res });
    }
  }
}

export const CloudinaryService = new CloudinaryServiceClass();
