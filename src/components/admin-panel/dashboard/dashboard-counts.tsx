import { notFound } from 'next/navigation';
import React from 'react'
import { getCounts } from '~/server/queries/pages';
import { ArrowRight, Building2, Database, Folder, LandPlot, MapIcon, MapPinned, Pickaxe, Users } from 'lucide-react'
import Link from 'next/link'
import { Button } from '~/components/ui/button'
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '~/components/ui/card'

export default async function DashboardCounts() {
  const result = await getCounts()
  
  // handle errors by next.js error or not found pages
  if (result.error !== null) {
    if (result.error === "Not Found") notFound();
    else throw new Error(result.error);
  };

  const { 
    usersCount,
    companiesCount,
    fieldsCount,
    licensedAreasCount,
    mapItemsCount,
    fieldsMapsCount,
    areasDataCount,
    filesCount,
   } = result.data

  return (
    <div className="sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 grid grid-cols-1 gap-4">
      <Card>
        <CardHeader className="relative pb-2">
          <CardDescription className='flex items-center justify-between gap-1 w-full'>
            <p>Пользователи</p>
            <Users className='text-foreground flex-none'/>
          </CardDescription>
          <CardTitle className=" text-2xl font-semibold tabular-nums">
            {usersCount}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-end gap-1 text-sm pb-4">
          <Link href='/dashboard/users' passHref>
            <Button variant="link" className="px-0">
              Перейти <ArrowRight size={16} className="flex-none" />
            </Button>
          </Link>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader className="relative pb-2">
          <CardDescription className='flex items-center justify-between gap-1 w-full'>
            <p>Компании</p>
            <Building2 className='text-foreground flex-none'/>
          </CardDescription>
          <CardTitle className=" text-2xl font-semibold tabular-nums">
            {companiesCount}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-end gap-1 text-sm pb-4">
          <Link href='/dashboard/companies' passHref>
            <Button variant="link" className="px-0">
              Перейти <ArrowRight size={16} className="flex-none" />
            </Button>
          </Link>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader className="relative pb-2">
          <CardDescription className='flex items-center justify-between gap-1 w-full'>
            <p>Месторождения</p>
            <Pickaxe className='text-foreground flex-none'/>
          </CardDescription>
          <CardTitle className=" text-2xl font-semibold tabular-nums">
            {fieldsCount}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-end gap-1 text-sm pb-4">
          <Link href='/dashboard/fields' passHref>
            <Button variant="link" className="px-0">
              Перейти <ArrowRight size={16} className="flex-none" />
            </Button>
          </Link>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader className="relative pb-2">
          <CardDescription className='flex items-center justify-between gap-1 w-full'>
            <p>Лиценз. участки</p>
            <LandPlot className='text-foreground flex-none'/>
          </CardDescription>
          <CardTitle className=" text-2xl font-semibold tabular-nums">
            {licensedAreasCount}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-end gap-1 text-sm pb-4">
          <Link href='/dashboard/licensed-areas' passHref>
            <Button variant="link" className="px-0">
              Перейти <ArrowRight size={16} className="flex-none" />
            </Button>
          </Link>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader className="relative pb-2">
          <CardDescription className='flex items-center justify-between gap-1 w-full'>
            <p>Точки на карте</p>
            <MapIcon className='text-foreground flex-none'/>
          </CardDescription>
          <CardTitle className=" text-2xl font-semibold tabular-nums">
            {mapItemsCount}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-end gap-1 text-sm pb-4">
          <Link href='/dashboard/map' passHref>
            <Button variant="link" className="px-0">
              Перейти <ArrowRight size={16} className="flex-none" />
            </Button>
          </Link>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader className="relative pb-2">
          <CardDescription className='flex items-center justify-between gap-1 w-full'>
            <p>Данные ЛУ</p>
            <Database className='text-foreground flex-none'/>
          </CardDescription>
          <CardTitle className=" text-2xl font-semibold tabular-nums">
            {areasDataCount}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-end gap-1 text-sm pb-4">
          <Link href='/dashboard/areas-data' passHref>
            <Button variant="link" className="px-0">
              Перейти <ArrowRight size={16} className="flex-none" />
            </Button>
          </Link>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader className="relative pb-2">
          <CardDescription className='flex items-center justify-between gap-1 w-full'>
            <p>Карты месторожд.</p>
            <MapPinned className='text-foreground flex-none'/>
          </CardDescription>
          <CardTitle className=" text-2xl font-semibold tabular-nums">
            {fieldsMapsCount}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-end gap-1 text-sm pb-4">
          <Link href='/dashboard/fmaps' passHref>
            <Button variant="link" className="px-0">
              Перейти <ArrowRight size={16} className="flex-none" />
            </Button>
          </Link>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader className="relative pb-2">
          <CardDescription className='flex items-center justify-between gap-1 w-full'>
            <p>Файлы</p>
            <Folder className='text-foreground flex-none'/>
          </CardDescription>
          <CardTitle className=" text-2xl font-semibold tabular-nums">
            {filesCount}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-end gap-1 text-sm pb-4">
          <Link href='/dashboard/files' passHref>
            <Button variant="link" className="px-0">
              Перейти <ArrowRight size={16} className="flex-none" />
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
