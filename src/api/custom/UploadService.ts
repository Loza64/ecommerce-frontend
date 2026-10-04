import Upload from '@/models/entities/Upload'
import Service from '@/sdk/core/Service'

export default class UploadService extends Service<Upload> {
  constructor() {
    super({ endpoint: 'uploads' })
  }

  /** Sube hasta 10 archivos por petición; conserva el orden recibido. */
  public async uploadMany(files: File[]): Promise<Upload[]> {
    const uploaded: Upload[] = []
    for (let i = 0; i < files.length; i += 10) {
      const form = new FormData()
      files.slice(i, i + 10).forEach((file) => form.append('files', file))
      const res = await this.axios.post<Upload[]>('uploads/many', form)
      uploaded.push(...res.data)
    }
    return uploaded
  }
}
