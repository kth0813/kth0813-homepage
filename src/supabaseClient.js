import * as r2Storage from "./r2Client";

export const supabase = {
  storage: {
    from: (bucket) => ({
      upload: async (path, file) => {
        const res = await r2Storage.uploadFile(bucket, path, file);
        return { data: res.data ? { path: res.data.path } : null, error: res.error };
      },
      getPublicUrl: (path) => {
        const res = r2Storage.getPublicUrl(bucket, path);
        return { data: { publicUrl: res.data.publicUrl } };
      },
      remove: async (paths) => {
        const errors = [];
        for (const path of paths) {
          const { error } = await r2Storage.deleteFile(bucket, path);
          if (error) errors.push(error);
        }
        return { data: null, error: errors.length > 0 ? errors[0] : null };
      },
      list: async (prefix) => {
        return await r2Storage.listFiles(bucket, prefix);
      }
    })
  }
};

export default supabase;
