import { type Row } from '@tanstack/react-table'
import { Loader, Trash } from 'lucide-react'
import React from 'react'
import { toast } from 'sonner'
import { Button } from '~/components/ui/button'
import { Credenza, CredenzaClose, CredenzaContent, CredenzaDescription, CredenzaFooter, CredenzaHeader, CredenzaTitle, CredenzaTrigger } from '~/components/ui/credenza'
import { type Dialog } from '~/components/ui/dialog'
import { deleteUsers } from '~/server/actions/users'
import { type User } from '~/server/db/schema'


interface DeleteUsersDialogProps extends React.ComponentPropsWithoutRef<typeof Dialog> {
  users: Row<User>["original"][]
  showTrigger?: boolean
  onSuccess?: () => void
}
export default function DeleteUsersDialog({
  users,
  showTrigger = true,
  onSuccess,
  ...props
}: DeleteUsersDialogProps) {
  const [isPending, startTransition] = React.useTransition()

  function onDelete() {
    startTransition(async () => {
      const { error } = await deleteUsers(users.map((user) => user.id))

      if (error) {
        toast.error(error)
        return
      }

      props.onOpenChange?.(false)
      toast.success("Пользователи удалены!")
      onSuccess?.()
    })
  }

  return (
    <Credenza {...props}>
      {showTrigger ? (
        <CredenzaTrigger asChild>
          <Button variant="outline" size="sm">
            <Trash className="mr-2 size-4" />
            Удалить ({users.length})
          </Button>
        </CredenzaTrigger>
      ) : null}
      <CredenzaContent>
        <CredenzaHeader>
          <CredenzaTitle>Вы абсолютно уверены?</CredenzaTitle>
          <CredenzaDescription>
            Это действие невозможно отменить. Это приведет к окончательному удалению{" "}
            <span className="font-medium">{users.length}</span>
            {users.length === 1 ? " Пользователя" : " Пользователей"}.
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
            {isPending && <Loader className="mr-2 size-4 animate-spin" />}
            Удалить
          </Button>
        </CredenzaFooter>
      </CredenzaContent>
    </Credenza>
  )
}
