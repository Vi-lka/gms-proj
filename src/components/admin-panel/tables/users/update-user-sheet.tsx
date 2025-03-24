import { zodResolver } from '@hookform/resolvers/zod'
import { Loader } from 'lucide-react'
import React from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import DateField from '~/components/forms/inputs/simple/date-field'
import SelectField from '~/components/forms/inputs/simple/select-field'
import { Button } from '~/components/ui/button'
import { Form } from '~/components/ui/form'
import { Sheet, SheetClose, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '~/components/ui/sheet'
import { idToSentenceCase } from '~/lib/utils'
import { updateUserSchema, type UpdateUserSchema } from '~/lib/validations/forms'
import { updateUser } from '~/server/actions/users'
import { users, type User } from '~/server/db/schema'

interface UpdateUserSheetProps
  extends React.ComponentPropsWithRef<typeof Sheet> {
  user: User | null
}

export default function UpdateUserSheet({
  user,
  ...props
}: UpdateUserSheetProps) {
  const [isPending, startTransition] = React.useTransition()

  const today = new Date()
  const untilDate = new Date(new Date().setDate(today.getDate() + 30));

  const form = useForm<UpdateUserSchema>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      role: user?.role ?? "unknown",
      guestUntil: user?.guestUntil ?? untilDate
    }
  })

  React.useEffect(() => {
    form.reset({
      role: user?.role ?? "unknown",
      guestUntil: user?.guestUntil ?? untilDate,
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  function onSubmit(input: UpdateUserSchema) {
    startTransition(async () => {
      if (!user) return

      const { data, error } = await updateUser({id: user.id, ...input})

      if (error) {
        toast.error(error)
        return
      }

      if (data) form.reset(data)
      else form.reset()

      form.reset()
      props.onOpenChange?.(false)
      toast.success("Пользователь изменен!")
    })
  }
  
  const saveDisabled = isPending || !form.formState.isValid || !form.formState.isDirty

  const roleOptions = users.role.enumValues.map((role) => ({
    value: role,
    label: idToSentenceCase(role),
  }))

  return (
    <Sheet {...props}>
      <SheetContent className="flex flex-col gap-6 sm:max-w-md">
        <SheetHeader className="text-left">
          <SheetTitle>Изменить Пользователя</SheetTitle>
        </SheetHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <SelectField
              form={form}
              name={'role'} 
              options={roleOptions}
              label={idToSentenceCase("role")}
              placeholder='Выберите роль'
              disabled={isPending}
            />
            {form.getValues("role") === "guest" && (
              <DateField 
                form={form} 
                name={"guestUntil"}
                label={idToSentenceCase("guestUntil")}
                disabled={isPending}
                startMonth={today}
                endMonth={new Date(today.getFullYear() + 100, 0)}
                disabledMatcher={(date) => date < today}
                className='w-full'
              />
            )}
            <SheetFooter className="gap-2 pt-2 sm:space-x-0">
              <SheetClose asChild>
                <Button type="button" variant="outline">
                  Отмена
                </Button>
              </SheetClose>
              <Button disabled={saveDisabled}>
                {isPending && <Loader className="mr-2 size-4 animate-spin" />}
                Сохранить
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
