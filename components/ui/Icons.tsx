import React from 'react';
import { 
  Activity, 
  MessageSquare, 
  Users, 
  FileText, 
  Heart, 
  Thermometer, 
  Clock, 
  AlertCircle,
  Mic,
  Send,
  Menu,
  X,
  Plus,
  Pill,
  Camera,
  ScanLine,
  FileUp,
  Stethoscope,
  CalendarCheck,
  Check,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Eye,
  Sun,
  Moon,
  CloudSun,
  Phone,
  Newspaper,
  Edit2,
  Trash2,
  Leaf,
  Tablets,
  Shield,
  FileCheck,
  QrCode,
  Share2,
  Printer,
  Globe,
  Dna
} from 'lucide-react';

export interface IconProps {
  size?: number | string;
  className?: string;
  color?: string;
  strokeWidth?: number | string;
  [key: string]: any;
}

export const IconActivity = (props: IconProps) => <Activity size={20} {...props} />;
export const IconChat = (props: IconProps) => <MessageSquare size={20} {...props} />;
export const IconFamily = (props: IconProps) => <Users size={20} {...props} />;
export const IconReport = (props: IconProps) => <FileText size={20} {...props} />;
export const IconHeart = ({className, ...props}: IconProps) => <Heart size={16} className={`text-rose-500 ${className || ''}`} {...props} />;
export const IconThermo = ({className, ...props}: IconProps) => <Thermometer size={16} className={`text-amber-500 ${className || ''}`} {...props} />;
export const IconClock = (props: IconProps) => <Clock size={14} {...props} />;
export const IconAlert = ({className, ...props}: IconProps) => <AlertCircle size={16} className={`text-red-500 ${className || ''}`} {...props} />;
export const IconMic = (props: IconProps) => <Mic size={20} {...props} />;
export const IconSend = (props: IconProps) => <Send size={20} {...props} />;
export const IconMenu = (props: IconProps) => <Menu size={24} {...props} />;
export const IconClose = (props: IconProps) => <X size={24} {...props} />;
export const IconPlus = (props: IconProps) => <Plus size={16} {...props} />;

// New Icons
export const IconPill = (props: IconProps) => <Pill size={20} {...props} />;
export const IconTablet = (props: IconProps) => <Tablets size={20} {...props} />;
export const IconCamera = (props: IconProps) => <Camera size={20} {...props} />;
export const IconScan = (props: IconProps) => <ScanLine size={20} {...props} />;
export const IconUpload = (props: IconProps) => <FileUp size={20} {...props} />;
export const IconStethoscope = (props: IconProps) => <Stethoscope size={20} {...props} />;
export const IconCalendar = (props: IconProps) => <CalendarCheck size={20} {...props} />;
export const IconCheck = (props: IconProps) => <Check size={16} {...props} />;
export const IconChevronRight = (props: IconProps) => <ChevronRight size={16} {...props} />;
export const IconChevronLeft = (props: IconProps) => <ChevronLeft size={16} {...props} />;
export const IconChevronDown = (props: IconProps) => <ChevronDown size={16} {...props} />;
export const IconEye = (props: IconProps) => <Eye size={16} {...props} />;
export const IconPhone = (props: IconProps) => <Phone size={20} {...props} />;
export const IconNews = (props: IconProps) => <Newspaper size={20} {...props} />;
export const IconEdit = (props: IconProps) => <Edit2 size={16} {...props} />;
export const IconTrash = (props: IconProps) => <Trash2 size={14} {...props} />;
export const IconLeaf = (props: IconProps) => <Leaf size={20} {...props} />;
export const IconShield = (props: IconProps) => <Shield size={20} {...props} />;
export const IconFileCheck = (props: IconProps) => <FileCheck size={20} {...props} />;

// Time of Day Icons
export const IconSun = (props: IconProps) => <Sun size={20} {...props} />;
export const IconCloudSun = (props: IconProps) => <CloudSun size={20} {...props} />;
export const IconMoon = (props: IconProps) => <Moon size={20} {...props} />;

// Health Passport Icons
export const IconQrCode = (props: IconProps) => <QrCode size={20} {...props} />;
export const IconShare = (props: IconProps) => <Share2 size={20} {...props} />;
export const IconPrinter = (props: IconProps) => <Printer size={20} {...props} />;
export const IconGlobe = (props: IconProps) => <Globe size={20} {...props} />;

// Heritage
export const IconDna = (props: IconProps) => <Dna size={20} {...props} />;
