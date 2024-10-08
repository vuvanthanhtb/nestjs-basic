import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { ResponseMessage } from 'decorator/customize';

@ApiTags('files')
@Controller('files')
export class FilesController {
  @Post('upload')
  @ResponseMessage('Upload file successfully')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    return {
      fileName: file.filename,
    };
  }
}
