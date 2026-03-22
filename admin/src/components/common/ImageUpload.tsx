'use client';

import { useState, useRef, useCallback } from 'react';
import { Box, Typography, IconButton, CircularProgress, Avatar, Stack } from '@mui/material';
import { CloudUploadOutlined, DeleteOutlined, AddPhotoAlternateOutlined } from '@mui/icons-material';
import { olentiaColors } from '@/lib/theme';
import { api } from '@/lib/api';

interface ImageUploadProps {
  value?: string | string[];
  onChange: (urls: string | string[]) => void;
  multiple?: boolean;
  maxFiles?: number;
  label?: string;
}

export default function ImageUpload({ value, onChange, multiple = false, maxFiles = 5, label = 'Resim Yükle' }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const images = Array.isArray(value) ? value : value ? [value] : [];

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);

    try {
      const maxCount = multiple ? Math.min(files.length, maxFiles - images.length) : 1;
      let urls: string[] = [];

      if (maxCount === 1) {
        // Single file upload
        const formData = new FormData();
        formData.append('file', files[0]);
        const { data } = await api.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        const result = data.data || data;
        urls = [result.url];
      } else {
        // Multiple file upload
        const formData = new FormData();
        for (let i = 0; i < maxCount; i++) {
          formData.append('files', files[i]);
        }
        const { data } = await api.post('/upload/multiple', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        const result = data.data || data;
        urls = result.urls || (Array.isArray(result) ? result.map((r: any) => r.url) : []);
      }

      if (multiple) {
        onChange([...images, ...urls]);
      } else {
        onChange(urls[0] || '');
      }
    } catch {
      // Fallback: create object URL for preview (won't persist)
      const newUrls: string[] = [];
      const maxCount = multiple ? Math.min(files.length, maxFiles - images.length) : 1;
      for (let i = 0; i < maxCount; i++) {
        newUrls.push(URL.createObjectURL(files[i]));
      }
      if (multiple) {
        onChange([...images, ...newUrls]);
      } else {
        onChange(newUrls[0] || '');
      }
    }

    setUploading(false);
    if (fileRef.current) fileRef.current.value = '';
  }, [images, multiple, maxFiles, onChange]);

  const handleRemove = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    if (multiple) {
      onChange(newImages);
    } else {
      onChange('');
    }
  };

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{label}</Typography>

      {/* Preview */}
      {images.length > 0 && (
        <Stack direction="row" spacing={1} sx={{ mb: 1.5, flexWrap: 'wrap' }} useFlexGap>
          {images.map((url, i) => (
            <Box key={i} sx={{ position: 'relative', width: 80, height: 80 }}>
              <Avatar src={url} variant="rounded" sx={{ width: 80, height: 80, border: '1px solid rgba(255,255,255,0.1)' }} />
              <IconButton
                size="small"
                onClick={() => handleRemove(i)}
                sx={{
                  position: 'absolute', top: -6, right: -6,
                  width: 22, height: 22, bgcolor: 'error.main', color: 'white',
                  '&:hover': { bgcolor: 'error.dark' },
                }}
              >
                <DeleteOutlined sx={{ fontSize: 14 }} />
              </IconButton>
            </Box>
          ))}
        </Stack>
      )}

      {/* Upload Area */}
      {(multiple ? images.length < maxFiles : images.length === 0) && (
        <Box
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
          onClick={() => fileRef.current?.click()}
          sx={{
            border: `2px dashed ${dragOver ? olentiaColors.primary.main : 'rgba(255,255,255,0.15)'}`,
            borderRadius: 2, py: 3, px: 2, textAlign: 'center', cursor: 'pointer',
            bgcolor: dragOver ? `${olentiaColors.primary.main}10` : 'transparent',
            transition: 'all 0.2s',
            '&:hover': { borderColor: olentiaColors.primary.main, bgcolor: `${olentiaColors.primary.main}08` },
          }}
        >
          {uploading ? (
            <CircularProgress size={28} sx={{ color: olentiaColors.primary.main }} />
          ) : (
            <>
              <AddPhotoAlternateOutlined sx={{ fontSize: 32, color: 'text.secondary', mb: 0.5 }} />
              <Typography variant="body2" color="text.secondary">
                Sürükle & bırak veya tıkla
              </Typography>
              <Typography variant="caption" color="text.disabled">
                PNG, JPG, WebP (max 5MB)
              </Typography>
            </>
          )}
        </Box>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        hidden
        onChange={(e) => handleFiles(e.target.files)}
      />
    </Box>
  );
}
