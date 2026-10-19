import { NextResponse } from 'next/server';
import { guard } from './lib/access';
export function proxy(request:Request){return guard(request)||NextResponse.next();}
export const config={matcher:['/((?!_next/static|_next/image|favicon.svg).*)']};
