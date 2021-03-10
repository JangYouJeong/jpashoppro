import org.w3c.dom.ls.LSInput;

import java.util.Scanner;

public class chap01_2 {

public static void main(String[] args) {
    Scanner stdIn = new Scanner(System.in);

    System.out.println("1부터 n까지의 합을 구합니다.");
    System.out.println("n의 값");
    int n = stdIn.nextInt();

    int sum = 0;
    int i = 1;

    while (i<=n) {
        sum +=i;
        i++;
    }
    System.out.println(sum);
}
}