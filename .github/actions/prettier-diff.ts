// checks if the code passes the format check, and if not it will **write** the updated code and display the _entire_ git diff.
// only intended for ci purposes since it assumes there are no changes in the working tree since it compares with the git diff.

const check_command = new Deno.Command(Deno.execPath(), {
  args: ['task', 'format:check'],
  stdout: 'inherit',
  stderr: 'inherit'
})

const { code } = await check_command.output()
Deno.exitCode = code // 0 = formatted properly, 1 = formatting issue, 2 = prettier error

if (code == 1) {
  const write_command = new Deno.Command(Deno.execPath(), {
    args: ['task', 'format'],
    // stdout: 'inherit',
    stderr: 'inherit'
  })

  await write_command.output()

  const diff_command = new Deno.Command('git', {
    args: ['diff'],
    stdout: 'inherit',
    stderr: 'inherit'
  })

  await diff_command.output()
}
