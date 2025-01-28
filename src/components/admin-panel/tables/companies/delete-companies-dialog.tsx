import { type Row } from '@tanstack/react-table'
import { Loader, Trash } from 'lucide-react'
import React from 'react'
import { toast } from 'sonner'
import { Button } from '~/components/ui/button'
import { Credenza, CredenzaClose, CredenzaContent, CredenzaDescription, CredenzaFooter, CredenzaHeader, CredenzaTitle, CredenzaTrigger } from '~/components/ui/credenza'
import { type Dialog } from '~/components/ui/dialog'
import { deleteCompanies } from '~/server/actions/companies'
import { type Company } from '~/server/db/schema'

interface DeleteCompaniesDialogProps extends React.ComponentPropsWithoutRef<typeof Dialog> {
  companies: Row<Company>["original"][]
  showTrigger?: boolean
  onSuccess?: () => void
}

export default function DeleteCompaniesFialog({
  companies,
  showTrigger = true,
  onSuccess,
  ...props
}: DeleteCompaniesDialogProps) {
  const [isPending, startTransition] = React.useTransition()

  function onDelete() {
    startTransition(async () => {
      const { error } = await deleteCompanies(companies.map((field) => field.id))

      if (error) {
        toast.error(error)
        return
      }

      props.onOpenChange?.(false)
      toast.success("Компании удалены!")
      onSuccess?.()
    })
  }

  return (
    <Credenza {...props}>
      {showTrigger ? (
        <CredenzaTrigger asChild>
          <Button variant="outline" size="sm">
            <Trash className="mr-2 size-4" aria-hidden="true" />
            Удалить ({companies.length})
          </Button>
        </CredenzaTrigger>
      ) : null}
      <CredenzaContent>
        <CredenzaHeader>
          <CredenzaTitle>Вы абсолютно уверены?</CredenzaTitle>
          <CredenzaDescription>
            Это действие невозможно отменить. Это приведет к окончательному удалению{" "}
            <span className="font-medium">{companies.length}</span>
            {companies.length === 1 ? " Компании" : " Компаний"}.
            Все данные, которые были привязаны, также будут удалены.
          </CredenzaDescription>
        </CredenzaHeader>
        <CredenzaFooter className="gap-2 sm:space-x-0">
          <CredenzaClose asChild>
            <Button variant="outline">Отмена</Button>
          </CredenzaClose>
          <Button
            variant="destructive"
            onClick={onDelete}
            disabled={isPending}
          >
            {isPending && (
              <Loader
                className="mr-2 size-4 animate-spin"
                aria-hidden="true"
              />
            )}
            Удалить
          </Button>
        </CredenzaFooter>
      </CredenzaContent>
    </Credenza>
  )
}
