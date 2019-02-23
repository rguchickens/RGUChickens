$nr=0
Dir *.jpg | %{Rename-Item $_ -NewName ("chicken_{0}.jpg" -f $nr++)}