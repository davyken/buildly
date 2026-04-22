import {
  IsString, IsOptional, IsArray, IsBoolean, IsNumber,
  IsObject, MaxLength, MinLength, Matches, ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

// ── Section DTOs (new section-based system) ────────────────────────────────────

export class NavLinkDto {
  @IsString() label: string;
  @IsString() href: string;
  @IsOptional() @IsString() pageId?: string;
}

export class SectionItemDto {
  @IsString() id: string;
  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsString() subtitle?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() icon?: string;
  @IsOptional() @IsString() image?: string;
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() role?: string;
  @IsOptional() @IsString() quote?: string;
  @IsOptional() @IsString() question?: string;
  @IsOptional() @IsString() answer?: string;
  @IsOptional() @IsString() label?: string;
  @IsOptional() @IsString() href?: string;
  @IsOptional() @IsString() group?: string;
  @IsOptional() @IsArray() links?: { label: string; href: string }[];
}

export class SectionStylesDto {
  @IsString() bg: string;
  @IsString() textColor: string;
  @IsString() accentColor: string;
  @IsOptional() @IsString() headingColor?: string;
  @IsOptional() @IsString() mutedColor?: string;
  @IsOptional() @IsString() cardBg?: string;
  @IsOptional() @IsString() borderColor?: string;
  @IsOptional() @IsString() overlayOpacity?: string;
}

export class SectionDto {
  @IsString() id: string;
  @IsString() type: string;
  @IsNumber() variant: number;
  @IsObject() content: Record<string, string>;
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => SectionItemDto) items?: SectionItemDto[];
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => NavLinkDto) navLinks?: NavLinkDto[];
  @ValidateNested() @Type(() => SectionStylesDto) styles: SectionStylesDto;
  @IsOptional() @IsBoolean() hidden?: boolean;
}

// ── Page DTO ──────────────────────────────────────────────────────────────────
export class SitePageDto {
  @IsString() id: string;
  @IsString() @MaxLength(100) name: string;

  @IsString()
  @Matches(/^\/[a-z0-9\-\/]*$/, {
    message: 'Path must start with / and contain only lowercase letters, numbers and hyphens',
  })
  path: string;

  // Sections (new system) — optional so old sites don't break
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SectionDto)
  sections?: SectionDto[];

  // Legacy elements (old free-form canvas) — kept so old saves still parse
  @IsOptional()
  @IsArray()
  elements?: any[];

  @IsOptional() @IsObject() meta?: { title?: string; description?: string };
}

// ── Site DTOs ─────────────────────────────────────────────────────────────────
export class CreateSiteDto {
  @IsString() @MinLength(1) @MaxLength(100) name: string;
  @IsOptional() @IsString() templateId?: string;
}

export class UpdateSiteDto {
  @IsOptional() @IsString() @MaxLength(100) name?: string;
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => SitePageDto) pages?: SitePageDto[];
  @IsOptional() @IsObject() meta?: {
    title?: string;
    description?: string;
    favicon?: string;
    language?: string;
  };
  @IsOptional() @IsString() globalBackground?: string;
}

export class AddPageDto {
  @IsString() @MaxLength(100) name: string;
  @IsString() @Matches(/^\/[a-z0-9\-\/]*$/) path: string;
}